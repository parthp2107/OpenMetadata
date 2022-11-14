/*
 *  Copyright 2021 Collate
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package org.openmetadata.service.events;

import com.lmax.disruptor.BatchEventProcessor;
import java.io.IOException;
import java.net.UnknownHostException;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.core.Response;
import lombok.extern.slf4j.Slf4j;
import org.openmetadata.common.utils.CommonUtil;
import org.openmetadata.schema.type.EventConfig;
import org.openmetadata.schema.type.FailureDetails;
import org.openmetadata.service.events.errors.EventPublisherException;
import org.openmetadata.service.jdbi3.CollectionDAO;
import org.openmetadata.service.jdbi3.EntityRepository;
import org.openmetadata.service.jdbi3.EventConfigRepository;
import org.openmetadata.service.jdbi3.EventConfigRepository.EventConfigUpdater;
import org.openmetadata.service.resources.events.EventResource;
import org.openmetadata.service.security.SecurityUtil;
import org.openmetadata.service.util.JsonUtils;
import org.openmetadata.service.util.RestUtil;

/**
 * EventPublisher publishes events to the eventConfig endpoint using POST http requests. There is one instance of
 * EventPublisher per eventConfig subscription. Each EventPublisher is an EventHandler that runs in a separate thread
 * and receives events from LMAX Disruptor {@link EventPubSub} through {@link BatchEventProcessor}.
 *
 * <p>The failures during callback to EventConfig endpoints are handled in this class as follows:
 *
 * <ul>
 *   <li>EventConfig with unresolvable URLs are marked as "failed" and no further attempt is made to deliver the events
 *   <li>EventConfig callbacks that return 3xx are marked as "failed" and no further attempt is made to deliver the
 *       events
 *   <li>EventConfig callbacks that return 4xx, 5xx, or timeout are marked as "awaitingRetry" and 5 retry attempts are
 *       made to deliver the events with the following backoff - 3 seconds, 30 seconds, 5 minutes, 1 hours, and 24 hour.
 *       When all the 5 delivery attempts fail, the eventConfig state is marked as "retryLimitReached" and no further
 *       attempt is made to deliver the events.
 * </ul>
 */
@Slf4j
public class EventPublisher extends AbstractEventPublisher {
  private final CountDownLatch shutdownLatch = new CountDownLatch(1);
  private final EventConfig eventConfig;
  private BatchEventProcessor<EventPubSub.ChangeEventHolder> processor;
  private Client client;
  private final CollectionDAO daoCollection;

  private final EventConfigRepository eventConfigRepository;

  public EventPublisher(EventConfig eventConfig, CollectionDAO dao) {
    super(eventConfig.getBatchSize(), eventConfig.getEventFilters());
    this.eventConfig = eventConfig;
    this.daoCollection = dao;
    this.eventConfigRepository = new EventConfigRepository(dao);
  }

  @Override
  public void onStart() {
    createClient();
    eventConfig.withFailureDetails(new FailureDetails());
    LOG.info("Webhook-lifecycle-onStart {}", eventConfig.getName());
  }

  @Override
  public void onShutdown() {
    currentBackoffTime = BACKOFF_NORMAL;
    client.close();
    client = null;
    shutdownLatch.countDown();
    LOG.info("Webhook-lifecycle-onShutdown {}", eventConfig.getName());
  }

  public synchronized EventConfig getEventConfig() {
    return eventConfig;
  }

  public synchronized void updateEventConfig(EventConfig updatedEventConfig) {
    currentBackoffTime = BACKOFF_NORMAL;
    eventConfig.setDescription(updatedEventConfig.getDescription());
    eventConfig.setTimeout(updatedEventConfig.getTimeout());
    eventConfig.setBatchSize(updatedEventConfig.getBatchSize());
    eventConfig.setEndpoint(updatedEventConfig.getEndpoint());
    eventConfig.setEventFilters(updatedEventConfig.getEventFilters());
    updateFilter();
    createClient();
  }

  private void updateFilter() {
    filter.clear();
    updateFilter(eventConfig.getEventFilters());
  }

  private void setErrorStatus(Long attemptTime, Integer statusCode, String reason)
      throws IOException, InterruptedException {
    if (!attemptTime.equals(eventConfig.getFailureDetails().getLastFailedAt())) {
      setStatus(EventConfig.Status.FAILED, attemptTime, statusCode, reason, null);
    }
    eventConfigRepository.deleteEventPublisher(eventConfig.getId());
    throw new RuntimeException(reason);
  }

  private void setAwaitingRetry(Long attemptTime, int statusCode, String reason) throws IOException {
    if (!attemptTime.equals(eventConfig.getFailureDetails().getLastFailedAt())) {
      setStatus(EventConfig.Status.AWAITING_RETRY, attemptTime, statusCode, reason, attemptTime + currentBackoffTime);
    }
  }

  private void setStatus(EventConfig.Status status, Long attemptTime, Integer statusCode, String reason, Long timestamp)
      throws IOException {
    EventConfig stored = daoCollection.eventConfigDAO().findEntityById(eventConfig.getId());
    eventConfig.setStatus(status);
    eventConfig
        .getFailureDetails()
        .withLastFailedAt(attemptTime)
        .withLastFailedStatusCode(statusCode)
        .withLastFailedReason(reason)
        .withNextAttempt(timestamp);

    // TODO: Fix this
    EventConfigUpdater updater = eventConfigRepository.getUpdater(stored, eventConfig, EntityRepository.Operation.PUT);
    updater.update();
  }

  private synchronized void createClient() {
    if (client != null) {
      client.close();
      client = null;
    }
    ClientBuilder clientBuilder = ClientBuilder.newBuilder();
    clientBuilder.connectTimeout(10, TimeUnit.SECONDS);
    clientBuilder.readTimeout(12, TimeUnit.SECONDS);
    client = clientBuilder.build();
  }

  public void awaitShutdown() throws InterruptedException {
    LOG.info("Awaiting shutdown webhook-lifecycle {}", eventConfig.getName());
    shutdownLatch.await(5, TimeUnit.SECONDS);
  }

  public void setProcessor(BatchEventProcessor<EventPubSub.ChangeEventHolder> processor) {
    this.processor = processor;
  }

  public BatchEventProcessor<EventPubSub.ChangeEventHolder> getProcessor() {
    return processor;
  }

  private Invocation.Builder getTarget() {
    Map<String, String> authHeaders = SecurityUtil.authHeaders("admin@open-metadata.org");
    return SecurityUtil.addHeaders(client.target(eventConfig.getEndpoint()), authHeaders);
  }

  @Override
  public void publish(EventResource.ChangeEventList list)
      throws EventPublisherException, IOException, InterruptedException {
    long attemptTime = System.currentTimeMillis();
    try {
      String json = JsonUtils.pojoToJson(list);
      Response response;
      if (eventConfig.getSecretKey() != null && !eventConfig.getSecretKey().isEmpty()) {
        String hmac = "sha256=" + CommonUtil.calculateHMAC(eventConfig.getSecretKey(), json);
        response = getTarget().header(RestUtil.SIGNATURE_HEADER, hmac).post(javax.ws.rs.client.Entity.json(json));
      } else {
        response = getTarget().post(javax.ws.rs.client.Entity.json(json));
      }
      LOG.info(
          "Webhook {}:{}:{} received response {}",
          eventConfig.getName(),
          eventConfig.getStatus(),
          batch.size(),
          response.getStatusInfo());
      // 2xx response means call back is successful
      if (response.getStatus() >= 200 && response.getStatus() < 300) { // All 2xx responses
        eventConfig.getFailureDetails().setLastSuccessfulAt(batch.get(batch.size() - 1).getTimestamp());
        batch.clear();
        if (eventConfig.getStatus() != EventConfig.Status.ACTIVE) {
          setStatus(EventConfig.Status.ACTIVE, null, null, null, null);
        }
      } else if (response.getStatus() >= 300 && response.getStatus() < 400) {
        // 3xx response/redirection is not allowed for callback. Set the webhook state as in error
        setErrorStatus(attemptTime, response.getStatus(), response.getStatusInfo().getReasonPhrase());
      } else if (response.getStatus() >= 300 && response.getStatus() < 600) {
        // 4xx, 5xx response retry delivering events after timeout
        setNextBackOff();
        setAwaitingRetry(attemptTime, response.getStatus(), response.getStatusInfo().getReasonPhrase());
        Thread.sleep(currentBackoffTime);
      }
    } catch (Exception ex) {
      Throwable cause = ex.getCause();
      if (cause != null && cause.getClass() == UnknownHostException.class) {
        LOG.warn("Invalid webhook {} endpoint {}", eventConfig.getName(), eventConfig.getEndpoint());
        setErrorStatus(attemptTime, null, "UnknownHostException");
      } else {
        LOG.debug("Exception occurred while publishing webhook", ex);
      }
    }
  }
}
