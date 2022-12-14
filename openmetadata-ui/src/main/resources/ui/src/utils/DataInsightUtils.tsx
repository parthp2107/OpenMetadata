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

import { Card, Typography } from 'antd';
import { RangePickerProps } from 'antd/lib/date-picker';
import { t } from 'i18next';
import {
  groupBy,
  isEmpty,
  isInteger,
  isString,
  isUndefined,
  last,
  sortBy,
  toNumber,
} from 'lodash';
import moment from 'moment';
import React from 'react';
import { ListItem, ListValues } from 'react-awesome-query-builder';
import { LegendProps, Surface } from 'recharts';
import { PLACEHOLDER_ROUTE_TAB, ROUTES } from '../constants/constants';
import {
  ENTITIES_SUMMARY_LIST,
  KPI_DATE_PICKER_FORMAT,
  WEB_SUMMARY_LIST,
} from '../constants/DataInsight.constants';
import { KpiTargetType } from '../generated/api/dataInsight/kpi/createKpiRequest';
import {
  DataInsightChartResult,
  DataInsightChartType,
} from '../generated/dataInsight/dataInsightChartResult';
import { Kpi, KpiResult } from '../generated/dataInsight/kpi/kpi';
import { DailyActiveUsers } from '../generated/dataInsight/type/dailyActiveUsers';
import { TotalEntitiesByTier } from '../generated/dataInsight/type/totalEntitiesByTier';
import {
  ChartValue,
  DataInsightChartTooltipProps,
  KpiDates,
} from '../interface/data-insight.interface';
import { pluralize } from './CommonUtils';
import { getFormattedDateFromMilliSeconds } from './TimeUtils';

const checkIsPercentageGraph = (dataInsightChartType: DataInsightChartType) =>
  [
    DataInsightChartType.PercentageOfEntitiesWithDescriptionByType,
    DataInsightChartType.PercentageOfEntitiesWithOwnerByType,
  ].includes(dataInsightChartType);

export const renderLegend = (legendData: LegendProps, latest: string) => {
  const { payload = [] } = legendData;

  return (
    <>
      <Typography.Text className="data-insight-label-text">
        Latest
      </Typography.Text>
      <Typography
        className="font-semibold text-2xl"
        style={{ margin: '5px 0px' }}>
        {latest}
      </Typography>
      <ul className="mr-2">
        {payload.map((entry, index) => (
          <li
            className="recharts-legend-item d-flex items-center"
            key={`item-${index}`}>
            <Surface className="mr-2" height={14} version="1.1" width={14}>
              <rect fill={entry.color} height="14" rx="2" width="14" />
            </Surface>
            <span>{entry.value}</span>
          </li>
        ))}
      </ul>
    </>
  );
};

const getEntryFormattedValue = (
  value: number | string | undefined,
  dataKey: number | string | undefined,
  kpiTooltipRecord: DataInsightChartTooltipProps['kpiTooltipRecord'],
  isPercentage?: boolean
) => {
  let suffix = '';
  if (isPercentage) {
    suffix = '%';
  }

  // handle kpi metric type check for entry value suffix

  if (
    !isUndefined(kpiTooltipRecord) &&
    !isEmpty(kpiTooltipRecord) &&
    !isUndefined(dataKey)
  ) {
    const metricType = kpiTooltipRecord[dataKey];
    suffix = metricType === KpiTargetType.Percentage ? '%' : suffix;
  }

  if (!isUndefined(value)) {
    if (isString(value)) {
      return `${value}${suffix}`;
    } else if (isInteger(value)) {
      return `${value}${suffix}`;
    } else {
      return `${value.toFixed(2)}${suffix}`;
    }
  } else {
    return '';
  }
};

export const CustomTooltip = (props: DataInsightChartTooltipProps) => {
  const { active, payload = [], label, isPercentage, kpiTooltipRecord } = props;

  if (active && payload && payload.length) {
    return (
      <Card>
        {/* this is a graph tooltip so using the explicit title here */}
        <Typography.Title level={5}>{label}</Typography.Title>
        {payload.map((entry, index) => (
          <li className="d-flex items-center" key={`item-${index}`}>
            <Surface className="mr-2" height={14} version="1.1" width={14}>
              <rect fill={entry.color} height="14" rx="2" width="14" />
            </Surface>
            <span>
              {entry.dataKey} -{' '}
              {getEntryFormattedValue(
                entry.value,
                entry.dataKey,
                kpiTooltipRecord,
                isPercentage
              )}
            </span>
          </li>
        ))}
      </Card>
    );
  }

  return null;
};

/**
 * takes timestamps and raw data as inputs and return the graph data by mapping timestamp
 * @param timestamps timestamps array
 * @param rawData graph rwa data
 * @returns graph data
 */
const prepareGraphData = (
  timestamps: string[],
  rawData: (
    | {
        [x: string]: ChartValue;
        timestamp: string;
      }
    | undefined
  )[]
) => {
  return (
    timestamps.map((timestamp) => {
      return rawData.reduce((previous, current) => {
        if (current?.timestamp === timestamp) {
          return { ...previous, ...current };
        }

        return previous;
      }, {});
    }) || []
  );
};

/**
 *
 * @param latestData latest chart data
 * @returns latest sum count for chart
 */
const getLatestCount = (latestData = {}) => {
  let total = 0;
  const latestEntries = Object.entries(latestData ?? {});

  for (const entry of latestEntries) {
    if (entry[0] !== 'timestamp') {
      total += toNumber(entry[1]);
    }
  }

  return total;
};

/**
 *
 * @param rawData raw chart data
 * @param dataInsightChartType chart type
 * @returns latest percentage for the chart
 */
const getLatestPercentage = (
  rawData: DataInsightChartResult['data'] = [],
  dataInsightChartType: DataInsightChartType
) => {
  let totalEntityCount = 0;
  let totalEntityWithDescription = 0;
  let totalEntityWithOwner = 0;

  const modifiedData = rawData
    .map((raw) => {
      const timestamp = raw.timestamp;
      if (timestamp) {
        return {
          ...raw,
          timestamp,
        };
      }

      return;
    })
    .filter(Boolean);

  const sortedData = sortBy(modifiedData, 'timestamp');
  const groupDataByTimeStamp = groupBy(sortedData, 'timestamp');
  const latestData = last(sortedData);
  if (latestData) {
    const latestChartRecords = groupDataByTimeStamp[latestData.timestamp];

    latestChartRecords.forEach((record) => {
      totalEntityCount += record?.entityCount ?? 0;
      totalEntityWithDescription += record?.completedDescription ?? 0;
      totalEntityWithOwner += record?.hasOwner ?? 0;
    });
    switch (dataInsightChartType) {
      case DataInsightChartType.PercentageOfEntitiesWithDescriptionByType:
        return ((totalEntityWithDescription / totalEntityCount) * 100).toFixed(
          2
        );

      case DataInsightChartType.PercentageOfEntitiesWithOwnerByType:
        return ((totalEntityWithOwner / totalEntityCount) * 100).toFixed(2);

      default:
        return 0;
    }
  }

  return 0;
};

/**
 *
 * @param rawData raw chart data
 * @param dataInsightChartType chart type
 * @returns formatted chart for graph
 */
const getGraphFilteredData = (
  rawData: DataInsightChartResult['data'] = [],
  dataInsightChartType: DataInsightChartType
) => {
  const entities: string[] = [];
  const timestamps: string[] = [];

  const filteredData = rawData
    .map((data) => {
      if (data.timestamp && data.entityType) {
        let value;
        const timestamp = getFormattedDateFromMilliSeconds(data.timestamp);
        if (!entities.includes(data.entityType ?? '')) {
          entities.push(data.entityType ?? '');
        }

        if (!timestamps.includes(timestamp)) {
          timestamps.push(timestamp);
        }

        switch (dataInsightChartType) {
          case DataInsightChartType.TotalEntitiesByType:
            value = data.entityCount;

            break;
          case DataInsightChartType.PercentageOfEntitiesWithDescriptionByType:
            value = (data.completedDescriptionFraction ?? 0) * 100;

            break;
          case DataInsightChartType.PercentageOfEntitiesWithOwnerByType:
            value = (data.hasOwnerFraction ?? 0) * 100;

            break;

          case DataInsightChartType.PageViewsByEntities:
            value = data.pageViews;

            break;

          default:
            break;
        }

        return {
          timestamp: timestamp,
          [data.entityType]: value,
        };
      }

      return;
    })
    .filter(Boolean);

  return { filteredData, entities, timestamps };
};

/**
 *
 * @param rawData raw chart data
 * @param dataInsightChartType chart type
 * @returns required graph data by entity type
 */
export const getGraphDataByEntityType = (
  rawData: DataInsightChartResult['data'] = [],
  dataInsightChartType: DataInsightChartType
) => {
  const isPercentageGraph = checkIsPercentageGraph(dataInsightChartType);

  const { filteredData, entities, timestamps } = getGraphFilteredData(
    rawData,
    dataInsightChartType
  );

  const graphData = prepareGraphData(timestamps, filteredData);
  const latestData = last(graphData);

  return {
    data: graphData,
    entities,
    total: isPercentageGraph
      ? getLatestPercentage(rawData, dataInsightChartType)
      : getLatestCount(latestData),
  };
};

/**
 *
 * @param rawData raw chart data
 * @returns required graph data by tier type
 */
export const getGraphDataByTierType = (rawData: TotalEntitiesByTier[]) => {
  const tiers: string[] = [];
  const timestamps: string[] = [];

  const filteredData = rawData.map((data) => {
    if (data.timestamp && data.entityTier) {
      const tiering = data.entityTier;
      const timestamp = getFormattedDateFromMilliSeconds(data.timestamp);
      if (!tiers.includes(tiering)) {
        tiers.push(tiering);
      }

      if (!timestamps.includes(timestamp)) {
        timestamps.push(timestamp);
      }

      return {
        timestamp: timestamp,
        [tiering]: data.entityCount,
      };
    }

    return;
  });

  const graphData = prepareGraphData(timestamps, filteredData);
  const latestData = last(graphData);

  return {
    data: graphData,
    tiers,
    total: getLatestCount(latestData),
  };
};

export const getTeamFilter = (suggestionValues: ListValues = []) => {
  return (suggestionValues as ListItem[]).map((suggestion: ListItem) => ({
    label: suggestion.title,
    value: suggestion.value,
  }));
};

export const getFormattedActiveUsersData = (activeUsers: DailyActiveUsers[]) =>
  activeUsers.map((user) => ({
    ...user,
    timestamp: user.timestamp
      ? getFormattedDateFromMilliSeconds(user.timestamp)
      : '',
  }));

export const getEntitiesChartSummary = (
  chartResults: (DataInsightChartResult | undefined)[]
) => {
  const updatedSummaryList = ENTITIES_SUMMARY_LIST.map((summary) => {
    // grab the current chart type
    const chartData = chartResults.find(
      (chart) => chart?.chartType === summary.id
    );

    // return default summary if chart data is undefined else calculate the latest count for chartType
    if (isUndefined(chartData)) return summary;
    else {
      if (chartData.chartType === DataInsightChartType.TotalEntitiesByTier) {
        const { total } = getGraphDataByTierType(chartData.data ?? []);

        return { ...summary, latest: total };
      } else {
        const { total } = getGraphDataByEntityType(
          chartData.data ?? [],
          chartData.chartType
        );

        return { ...summary, latest: total };
      }
    }
  });

  return updatedSummaryList;
};

export const getWebChartSummary = (
  chartResults: (DataInsightChartResult | undefined)[]
) => {
  const updatedSummary = WEB_SUMMARY_LIST.map((summary) => {
    // grab the current chart type
    const chartData = chartResults.find(
      (chart) => chart?.chartType === summary.id
    );
    // return default summary if chart data is undefined else calculate the latest count for chartType
    if (isUndefined(chartData)) return summary;
    else {
      if (chartData.chartType === DataInsightChartType.DailyActiveUsers) {
        const latestData = last(chartData.data);

        return { ...summary, latest: latestData?.activeUsers ?? 0 };
      } else {
        const { total } = getGraphDataByEntityType(
          chartData.data ?? [],
          chartData.chartType
        );

        return { ...summary, latest: total };
      }
    }
  });

  return updatedSummary;
};

export const getKpiGraphData = (kpiResults: KpiResult[], kpiList: Kpi[]) => {
  const kpis: string[] = [];
  const timeStamps: string[] = [];

  const formattedData = kpiResults.map((kpiResult) => {
    const timestamp = getFormattedDateFromMilliSeconds(kpiResult.timestamp);
    const kpiFqn = kpiResult.kpiFqn ?? '';
    const currentKpi = kpiList.find((kpi) => kpi.fullyQualifiedName === kpiFqn);
    const kpiTarget = kpiResult.targetResult[0];
    const kpiValue = toNumber(kpiTarget.value);
    if (!timeStamps.includes(timestamp)) {
      timeStamps.push(timestamp);
    }
    if (!kpis.includes(kpiFqn)) {
      kpis.push(kpiFqn);
    }

    return {
      timestamp,
      [kpiFqn]:
        currentKpi?.metricType === KpiTargetType.Percentage
          ? kpiValue * 100
          : kpiValue,
    };
  });

  return { graphData: prepareGraphData(timeStamps, formattedData), kpis };
};

export const getDisabledDates: RangePickerProps['disabledDate'] = (current) => {
  // Can not select days before today

  return current && current.isBefore(moment().subtract(1, 'day'));
};

export const getKpiDateFormatByTimeStamp = (timestamp: number) =>
  moment(timestamp).format(KPI_DATE_PICKER_FORMAT);

export const getKpiTargetValueByMetricType = (
  metricType: KpiTargetType,
  metricValue: number
) => {
  if (metricType === KpiTargetType.Percentage) {
    return metricValue / 100;
  }

  return metricValue;
};

export const getKpiResultFeedback = (day: number, isTargetMet: boolean) => {
  if (day > 0 && isTargetMet) {
    return t('label.kpi-target-achieved-before-time');
  } else if (day <= 0 && !isTargetMet) {
    return t('label.kpi-target-overdue');
  } else if (isTargetMet) {
    return t('label.kpi-target-achieved');
  } else {
    return t('label.day-left', { day: pluralize(day, 'day') });
  }
};

export const getDataInsightPathWithFqn = (fqn: string) =>
  ROUTES.DATA_INSIGHT_WITH_TAB.replace(PLACEHOLDER_ROUTE_TAB, fqn);

export const getKPIFormattedDates = (kpiDates: KpiDates): KpiDates => {
  return {
    startDate: `${kpiDates.startDate} 00:00`,
    endDate: `${kpiDates.endDate} 23:59`,
  };
};
