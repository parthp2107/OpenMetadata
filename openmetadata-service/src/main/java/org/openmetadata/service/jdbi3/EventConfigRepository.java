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

package org.openmetadata.service.jdbi3;

import static org.openmetadata.service.util.EntityUtil.eventFilterMatch;
import static org.openmetadata.service.util.EntityUtil.failureDetailsMatch;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.lmax.disruptor.BatchEventProcessor;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.openmetadata.schema.filter.EventFilter;
import org.openmetadata.schema.type.EventConfig;
import org.openmetadata.schema.type.EventConfigType;
import org.openmetadata.service.Entity;
import org.openmetadata.service.events.EventPubSub;
import org.openmetadata.service.events.EventPubSub.ChangeEventHolder;
import org.openmetadata.service.events.EventPublisher;
import org.openmetadata.service.events.MSTeamsEventPublisher;
import org.openmetadata.service.resources.events.EventConfigResource;
import org.openmetadata.service.slack.SlackEventEventPublisher;
import org.openmetadata.service.util.EntityUtil.Fields;

@Slf4j
public class EventConfigRepository extends EntityRepository<EventConfig> {
  private static final ConcurrentHashMap<UUID, EventPublisher> eventConfigPublisherMap = new ConcurrentHashMap<>();

  public EventConfigRepository(CollectionDAO dao) {
    super(
        EventConfigResource.COLLECTION_PATH, Entity.EVENT_CONFIG, EventConfig.class, dao.eventConfigDAO(), dao, "", "");
  }

  @Override
  public EventConfig setFields(EventConfig entity, Fields fields) {
    return entity; // No fields to set
  }

  @Override
  public void prepare(EventConfig entity) {
    /* Nothing to do */
  }

  @Override
  public void storeEntity(EventConfig entity, boolean update) throws IOException {
    entity.setHref(null);
    store(entity, update);
  }

  @Override
  public void storeRelationships(EventConfig entity) {
    // No relationship to store
  }

  @Override
  public void restorePatchAttributes(EventConfig original, EventConfig updated) {
    updated.withId(original.getId()).withName(original.getName());
  }

  @Override
  public EventConfigUpdater getUpdater(EventConfig original, EventConfig updated, Operation operation) {
    return new EventConfigUpdater(original, updated, operation);
  }

  private EventPublisher getPublisher(UUID id) {
    return eventConfigPublisherMap.get(id);
  }

  public void addEventPublisher(EventConfig eventConfig) {
    if (Boolean.FALSE.equals(eventConfig.getEnabled())) { // Only add Event that is enabled for publishing events
      eventConfig.setStatus(EventConfig.Status.DISABLED);
      return;
    }

    EventPublisher publisher;
    if (eventConfig.getEventConfigType() == EventConfigType.slack) {
      publisher = new SlackEventEventPublisher(eventConfig, daoCollection);
    } else if (eventConfig.getEventConfigType() == EventConfigType.msteams) {
      publisher = new MSTeamsEventPublisher(eventConfig, daoCollection);
    } else {
      publisher = new EventPublisher(eventConfig, daoCollection);
    }
    BatchEventProcessor<ChangeEventHolder> processor = EventPubSub.addEventHandler(publisher);
    publisher.setProcessor(processor);
    eventConfigPublisherMap.put(eventConfig.getId(), publisher);
    LOG.info("Event publisher subscription started for {}", eventConfig.getName());
  }

  @SneakyThrows
  public void updateEventPublisher(EventConfig eventConfig) {
    if (Boolean.TRUE.equals(eventConfig.getEnabled())) { // Only add Event that is enabled for publishing
      // If there was a previous Event either in disabled state or stopped due
      // to errors, update it and restart publishing
      EventPublisher previousPublisher = getPublisher(eventConfig.getId());
      if (previousPublisher == null) {
        addEventPublisher(eventConfig);
        return;
      }

      // Update the existing publisher
      EventConfig.Status status = previousPublisher.getEventConfig().getStatus();
      previousPublisher.updateEventConfig(eventConfig);
      if (status != EventConfig.Status.ACTIVE && status != EventConfig.Status.AWAITING_RETRY) {
        // Restart the previously stopped publisher (in states notStarted, error, retryLimitReached)
        BatchEventProcessor<ChangeEventHolder> processor = EventPubSub.addEventHandler(previousPublisher);
        previousPublisher.setProcessor(processor);
        LOG.info("Event publisher restarted for {}", eventConfig.getName());
      }
    } else {
      // Remove the Event publisher
      deleteEventPublisher(eventConfig.getId());
    }
  }

  public void deleteEventPublisher(UUID id) throws InterruptedException {
    EventPublisher publisher = eventConfigPublisherMap.remove(id);
    if (publisher != null) {
      publisher.getProcessor().halt();
      publisher.awaitShutdown();
      EventPubSub.removeProcessor(publisher.getProcessor());
      LOG.info("Event publisher deleted for {}", publisher.getEventConfig().getName());
    }
  }

  public class EventConfigUpdater extends EntityUpdater {
    public EventConfigUpdater(EventConfig original, EventConfig updated, Operation operation) {
      super(original, updated, operation);
    }

    @Override
    public void entitySpecificUpdate() throws IOException {
      recordChange("enabled", original.getEnabled(), updated.getEnabled());
      recordChange("status", original.getStatus(), updated.getStatus());
      recordChange("endPoint", original.getEndpoint(), updated.getEndpoint());
      recordChange("batchSize", original.getBatchSize(), updated.getBatchSize());
      recordChange("timeout", original.getTimeout(), updated.getTimeout());
      updateEventFilters();
      if (fieldsChanged()) {
        // If updating the other fields, opportunistically use it to capture failure details
        EventPublisher publisher = EventConfigRepository.this.getPublisher(original.getId());
        if (publisher != null && updated != publisher.getEventConfig()) {
          updated
              .withStatus(publisher.getEventConfig().getStatus())
              .withFailureDetails(publisher.getEventConfig().getFailureDetails());
          if (Boolean.FALSE.equals(updated.getEnabled())) {
            updated.setStatus(EventConfig.Status.DISABLED);
          }
        }
        recordChange(
            "failureDetails", original.getFailureDetails(), updated.getFailureDetails(), true, failureDetailsMatch);
      }
    }

    private void updateEventFilters() throws JsonProcessingException {
      List<EventFilter> origFilter = original.getEventFilters();
      List<EventFilter> updatedFilter = updated.getEventFilters();
      List<EventFilter> added = new ArrayList<>();
      List<EventFilter> deleted = new ArrayList<>();
      recordListChange("eventFilters", origFilter, updatedFilter, added, deleted, eventFilterMatch);
    }
  }
}
