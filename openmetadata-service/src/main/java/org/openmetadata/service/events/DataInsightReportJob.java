package org.openmetadata.service.events;

import static java.time.temporal.TemporalAdjusters.previous;
import static org.openmetadata.schema.dataInsight.DataInsightChartResult.DataInsightChartType.PAGE_VIEWS_BY_ENTITIES;
import static org.openmetadata.service.Entity.DATA_REPORT;
import static org.openmetadata.service.elasticsearch.ElasticSearchIndexDefinition.ElasticSearchIndexType.ENTITY_REPORT_DATA_INDEX;
import static org.openmetadata.service.resources.dataReports.DataReportResource.ES_REST_CLIENT;
import static org.openmetadata.service.resources.dataReports.DataReportResource.JOB_CONTEXT_CHART_REPO;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.openmetadata.schema.dataInsight.DataInsightChartResult;
import org.openmetadata.schema.dataInsight.type.PercentageOfEntitiesWithDescriptionByType;
import org.openmetadata.schema.entity.data.DataReport;
import org.openmetadata.service.jdbi3.DataInsightChartRepository;
import org.openmetadata.service.util.EmailUtil;
import org.openmetadata.service.util.GraphUtil;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

@Slf4j
public class DataInsightReportJob implements Job {

  @Override
  public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
    DataInsightChartRepository repository =
        (DataInsightChartRepository) jobExecutionContext.getJobDetail().getJobDataMap().get(JOB_CONTEXT_CHART_REPO);
    RestHighLevelClient client =
        (RestHighLevelClient) jobExecutionContext.getJobDetail().getJobDataMap().get(ES_REST_CLIENT);
    DataReport dataReport = (DataReport) jobExecutionContext.getJobDetail().getJobDataMap().get(DATA_REPORT);
    Long previousSunday = LocalDateTime.now().with(previous(DayOfWeek.SUNDAY)).toEpochSecond(ZoneOffset.UTC) * 1000;
    Long currentTime = LocalDateTime.now().toEpochSecond(ZoneOffset.UTC) * 1000;
    try {
      // Aggregate date for Description
      String descriptionUrl = buildDescriptionUrl(repository, client, previousSunday, currentTime);
      //  repository.
      for (String email : dataReport.getEndpointConfiguration().getRecipientMails()) {
        EmailUtil.getInstance()
            .sendDataInsightEmailNotificationToUser(
                email,
                "http://localhost:8585/data-insights",
                descriptionUrl,
                descriptionUrl,
                "http://mohit.com",
                EmailUtil.getInstance().getDataInsightReportSubject(),
                EmailUtil.DATA_INSIGHT_REPORT_TEMPLATE);
      }
    } catch (Exception e) {
      LOG.error("[DIReport] Failed in sending report due to", e);
      throw new RuntimeException(e);
    }
  }

  private String buildDescriptionUrl(
      DataInsightChartRepository repository, RestHighLevelClient client, Long previousSunday, Long currentTime)
      throws IOException, ParseException {
    SearchRequest searchRequest =
        repository.buildSearchRequest(
            previousSunday, currentTime, null, null, PAGE_VIEWS_BY_ENTITIES, ENTITY_REPORT_DATA_INDEX.indexName);
    SearchResponse searchResponse = client.search(searchRequest, RequestOptions.DEFAULT);
    DataInsightChartResult processedData =
        repository.processDataInsightChartResult(searchResponse, PAGE_VIEWS_BY_ENTITIES);

    Map<String, List<PercentageOfEntitiesWithDescriptionByType>> sortedDataMap = new HashMap<>();
    Map<String, Map<String, Long>> graphData = new HashMap<>();
    for (Object data : processedData.getData()) {
      PercentageOfEntitiesWithDescriptionByType formattedData = (PercentageOfEntitiesWithDescriptionByType) data;
      List<PercentageOfEntitiesWithDescriptionByType> listChartType;
      if (sortedDataMap.containsKey(formattedData.getEntityType())) {
        listChartType = sortedDataMap.get(formattedData.getEntityType());
      } else {
        listChartType = new ArrayList<>();
      }
      listChartType.add(formattedData);
      sortedDataMap.put(formattedData.getEntityType(), listChartType);
    }
    for (var entry : sortedDataMap.entrySet()) {
      for (PercentageOfEntitiesWithDescriptionByType formattedData : entry.getValue()) {
        Date date = new Date(formattedData.getTimestamp());
        String justDate = new SimpleDateFormat("dd/MM/yyyy").format(date);
        // put data to map
        List<PercentageOfEntitiesWithDescriptionByType> listChartType;
        if (sortedDataMap.containsKey(justDate)) {
          listChartType = sortedDataMap.get(justDate);
        } else {
          listChartType = new ArrayList<>();
        }
        listChartType.add(formattedData);
        sortedDataMap.put(justDate, listChartType);
      }
      System.out.println(entry.getKey() + "/" + entry.getValue());
    }
    return GraphUtil.buildDescriptionImageUrl(sortedDataMap);
  }
}
