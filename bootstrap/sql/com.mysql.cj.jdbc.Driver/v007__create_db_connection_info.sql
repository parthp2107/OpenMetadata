-- Remove markDeletedTablesFromFilterOnly 
UPDATE ingestion_pipeline_entity
SET json = JSON_REMOVE(json ,'$.sourceConfig.config.markDeletedTablesFromFilterOnly');

UPDATE data_insight_chart
SET json = JSON_INSERT(
	JSON_REMOVE(json, '$.dimensions'),
	'$.dimensions',
	JSON_ARRAY(
		JSON_OBJECT('name', 'entityFqn', 'chartDataType', 'STRING'),
		JSON_OBJECT('name', 'owner', 'chartDataType', 'STRING'),
		JSON_OBJECT('name', 'entityType', 'chartDataType', 'STRING'),
		JSON_OBJECT('name', 'entityHref', 'chartDataType', 'STRING')
		)
)
WHERE name = 'mostViewedEntities';

CREATE TABLE IF NOT EXISTS data_report_entity (
    id VARCHAR(36) GENERATED ALWAYS AS (json ->> '$.id') STORED NOT NULL,
    name VARCHAR(256) GENERATED ALWAYS AS (json ->> '$.name') NOT NULL,
    dataReportType VARCHAR(36) GENERATED ALWAYS AS (json ->> '$.dataReportType') NOT NULL,
    endpointType VARCHAR(50) GENERATED ALWAYS AS (json ->> '$.endpointType') NOT NULL,
    scheduleConfig VARCHAR(36) GENERATED ALWAYS AS (json ->> '$.scheduleConfig') NOT NULL,
    json JSON NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (name)
);
