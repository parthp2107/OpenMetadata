package org.openmetadata.service.jdbi3;

import static org.openmetadata.service.Entity.DATA_REPORT;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.elasticsearch.client.RestHighLevelClient;
import org.openmetadata.schema.entity.data.DataReport;
import org.openmetadata.service.events.DataInsightReportJob;
import org.openmetadata.service.events.ReportScheduler;
import org.openmetadata.service.resources.dataReports.DataReportResource;
import org.openmetadata.service.util.EntityUtil.Fields;
import org.quartz.Job;
import org.quartz.SchedulerException;

@Slf4j
public class DataReportRepository extends EntityRepository<DataReport> {

  private ReportScheduler reportScheduler;
  private static final ConcurrentHashMap<UUID, Job> dataReportJobMap = new ConcurrentHashMap<>();

  public DataReportRepository(CollectionDAO dao) {
    super(DataReportResource.COLLECTION_PATH, DATA_REPORT, DataReport.class, dao.dataReportDAO(), dao, "", "");
  }

  @Override
  public DataReport setFields(DataReport entity, Fields fields) throws IOException {
    return entity; // No fields to set
  }

  @Override
  public void prepare(DataReport entity) throws IOException {
    /* Nothing to do */
  }

  @Override
  public void storeEntity(DataReport entity, boolean update) throws IOException {
    entity.setHref(null);
    store(entity, update);
  }

  @Override
  public void storeRelationships(DataReport entity) throws IOException {
    // No relationship to store
  }

  private Job getJob(UUID id) {
    return dataReportJobMap.get(id);
  }

  public void addDataReportConfig(DataReport dataReport, RestHighLevelClient client) {
    reportScheduler = new ReportScheduler(client, daoCollection);
    reportScheduler.startDataInsightEmailReportPublisher(dataReport, client);
    Job job = new DataInsightReportJob();
    dataReportJobMap.put(dataReport.getId(), job);
  }

  public void updateDataReportConfig(DataReport dataReport, RestHighLevelClient client) throws SchedulerException {
    reportScheduler = new ReportScheduler(client, daoCollection);
    Job previousJob = getJob(dataReport.getId());
    if (previousJob == null) {
      addDataReportConfig(dataReport, client);
      return;
    }
    reportScheduler.updateDataInsightEmailReportPublisher(dataReport, client);
  }

  public void deleteDataReportConfig(DataReport dataReport, RestHighLevelClient client) throws SchedulerException {
    Job job = dataReportJobMap.remove(dataReport.getId());
    if (job != null) {
      reportScheduler = new ReportScheduler(client, daoCollection);
      reportScheduler.deleteDataInsightEmailReportPublisher(dataReport.getId());
      LOG.info("Report Config deleted");
    }
  }
}
