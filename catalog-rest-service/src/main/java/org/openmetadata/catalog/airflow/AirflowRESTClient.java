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

package org.openmetadata.catalog.airflow;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import javax.ws.rs.core.Response;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.openmetadata.catalog.airflow.models.AirflowAuthRequest;
import org.openmetadata.catalog.airflow.models.AirflowAuthResponse;
import org.openmetadata.catalog.api.services.ingestionPipelines.TestServiceConnection;
import org.openmetadata.catalog.entity.services.ingestionPipelines.IngestionPipeline;
import org.openmetadata.catalog.entity.services.ingestionPipelines.PipelineStatus;
import org.openmetadata.catalog.exception.IngestionPipelineDeploymentException;
import org.openmetadata.catalog.exception.PipelineServiceClientException;
import org.openmetadata.catalog.util.JsonUtils;
import org.openmetadata.catalog.util.PipelineServiceClient;

@Slf4j
public class AirflowRESTClient extends PipelineServiceClient {
  private final String authEndpoint;
  private final String deployEndpoint;

  public AirflowRESTClient(AirflowConfiguration airflowConfig) {
    super(
        airflowConfig.getUsername(),
        airflowConfig.getPassword(),
        airflowConfig.getApiEndpoint(),
        airflowConfig.getTimeout());
    authEndpoint = String.format("%s/api/v1/security/login", serviceURL);
    deployEndpoint = String.format("%s/rest_api/api?api=deploy_dag", serviceURL);
  }

  @SneakyThrows
  @Override
  public String authenticate() throws IOException {
    AirflowAuthRequest authRequest =
        AirflowAuthRequest.builder().username(this.username).password(this.password).build();
    String authPayload = JsonUtils.pojoToJson(authRequest);
    HttpResponse<String> response = post(authEndpoint, authPayload, false);
    if (response.statusCode() == 200) {
      AirflowAuthResponse authResponse = JsonUtils.readValue(response.body(), AirflowAuthResponse.class);
      return authResponse.getAccessToken();
    }
    throw new PipelineServiceClientException(
        "Failed to get access_token. Please check AirflowConfiguration username, password");
  }

  @Override
  public String deployPipeline(IngestionPipeline ingestionPipeline) {
    HttpResponse<String> response;
    try {
      String pipelinePayload = JsonUtils.pojoToJson(ingestionPipeline);
      response = post(deployEndpoint, pipelinePayload);
      if (response.statusCode() == 200) {
        return response.body();
      }
    } catch (Exception e) {
      throw IngestionPipelineDeploymentException.byMessage(ingestionPipeline.getName(), e.getMessage());
    }

    throw new PipelineServiceClientException(
        String.format(
            "%s Failed to deploy Ingestion Pipeline due to airflow API returned %s and response %s",
            ingestionPipeline.getName(), Response.Status.fromStatusCode(response.statusCode()), response.body()));
  }

  @Override
  public String deletePipeline(String pipelineName) {
    try {
      String deleteEndpoint = "%s/rest_api/api?api=delete_dag&dag_id=%s";
      String deleteUrl = String.format(deleteEndpoint, serviceURL, pipelineName);
      JSONObject requestPayload = new JSONObject();
      requestPayload.put("workflow_name", pipelineName);
      HttpResponse<String> response = post(deleteUrl, requestPayload.toString());
      return response.body();
    } catch (Exception e) {
      LOG.error(String.format("Failed to delete Airflow Pipeline %s from Airflow DAGS", pipelineName));
    }
    return null;
  }

  @Override
  public String runPipeline(String pipelineName) {
    HttpResponse<String> response;
    try {
      String triggerEndPoint = "%s/rest_api/api?api=trigger_dag";
      String triggerUrl = String.format(triggerEndPoint, serviceURL);
      JSONObject requestPayload = new JSONObject();
      requestPayload.put("workflow_name", pipelineName);
      response = post(triggerUrl, requestPayload.toString());
      if (response.statusCode() == 200) {
        return response.body();
      }
    } catch (Exception e) {
      throw IngestionPipelineDeploymentException.byMessage(pipelineName, e.getMessage());
    }

    throw IngestionPipelineDeploymentException.byMessage(
        pipelineName, "Failed to trigger IngestionPipeline", Response.Status.fromStatusCode(response.statusCode()));
  }

  @Override
  public IngestionPipeline getPipelineStatus(IngestionPipeline ingestionPipeline) {
    HttpResponse<String> response;
    try {
      String statusEndPoint = "%s/rest_api/api?api=dag_status&dag_id=%s";
      String statusUrl = String.format(statusEndPoint, serviceURL, ingestionPipeline.getName());
      JSONObject requestPayload = new JSONObject();
      response = post(statusUrl, requestPayload.toString());
      if (response.statusCode() == 200) {
        List<PipelineStatus> statuses = JsonUtils.readObjects(response.body(), PipelineStatus.class);
        ingestionPipeline.setPipelineStatuses(statuses);
        ingestionPipeline.setDeployed(true);
        return ingestionPipeline;
      } else if (response.statusCode() == 404) {
        ingestionPipeline.setDeployed(false);
      }
    } catch (Exception e) {
      throw PipelineServiceClientException.byMessage(ingestionPipeline.getName(), e.getMessage());
    }
    throw PipelineServiceClientException.byMessage(
        ingestionPipeline.getName(),
        "Failed to fetch ingestion pipeline runs",
        Response.Status.fromStatusCode(response.statusCode()));
  }

  @Override
  public HttpResponse<String> getServiceStatus() {
    HttpResponse<String> response;
    try {
      String token = authenticate();
      String authToken = String.format(AUTH_TOKEN, token);
      String statusEndPoint = "%s/rest_api/api?api=rest_status";
      String statusUrl = String.format(statusEndPoint, serviceURL);
      HttpRequest request =
          HttpRequest.newBuilder(URI.create(statusUrl))
              .header(CONTENT_HEADER, CONTENT_TYPE)
              .header(AUTH_HEADER, authToken)
              .GET()
              .build();
      response = client.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() == 200) {
        return response;
      }
    } catch (Exception e) {
      throw PipelineServiceClientException.byMessage("Failed to get REST status.", e.getMessage());
    }
    throw new PipelineServiceClientException(String.format("Failed to get REST status due to %s", response.body()));
  }

  @Override
  public HttpResponse<String> testConnection(TestServiceConnection testServiceConnection) {
    HttpResponse<String> response;
    try {
      String statusEndPoint = "%s/rest_api/api?api=test_connection";
      String statusUrl = String.format(statusEndPoint, serviceURL);
      String connectionPayload = JsonUtils.pojoToJson(testServiceConnection);
      response = post(statusUrl, connectionPayload);
      if (response.statusCode() == 200) {
        return response;
      }
    } catch (Exception e) {
      throw PipelineServiceClientException.byMessage("Failed to test connection.", e.getMessage());
    }
    throw new PipelineServiceClientException(String.format("Failed to test connection due to %s", response.body()));
  }
}
