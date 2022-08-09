#  Copyright 2021 Collate
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#  http://www.apache.org/licenses/LICENSE-2.0
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

"""
Test Table and Column Tests' validate implementations.

Each test should validate the Success, Failure and Aborted statuses
"""

from datetime import datetime

from metadata.generated.schema.entity.data.table import ColumnProfile, TableProfile
from metadata.generated.schema.tests.basic import TestCaseResult, TestCaseStatus
from metadata.generated.schema.tests.column.columnValuesLengthsToBeBetween import (
    ColumnValueLengthsToBeBetween,
)
from metadata.generated.schema.tests.column.columnValuesToBeBetween import (
    ColumnValuesToBeBetween,
)
from metadata.generated.schema.tests.column.columnValuesToBeNotNull import (
    ColumnValuesToBeNotNull,
)
from metadata.generated.schema.tests.column.columnValuesToBeUnique import (
    ColumnValuesToBeUnique,
)
from metadata.generated.schema.tests.testCase import TestCase, TestCaseParameterValue
from metadata.orm_profiler.validations.core import validation_enum_registry

EXECUTION_DATE = datetime.strptime("2021-07-03", "%Y-%m-%d")


def test_table_row_count_to_equal():
    """
    Check TableRowCountToEqual
    """
    table_profile = TableProfile(
        timestamp=EXECUTION_DATE.timestamp(),
        rowCount=100,
    )

    res_ok = validation_enum_registry.registry["TableRowCountToEqual"](
        TestCase(
            name="my_test_case",
            parameterValues=[TestCaseParameterValue(name="value", value=100)],
        ),
        test_definition=None,
        table_profile=table_profile,
        execution_date=EXECUTION_DATE,
    )
    assert res_ok == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Success,
        result="Found 100.0 rows vs. the expected 100",
    )

    res_ko = validation_enum_registry.registry["TableRowCountToEqual"](
        TestCase(
            name="my_test_case",
            parameterValues=[TestCaseParameterValue(name="value", value=50)],
        ),
        test_definition=None,
        table_profile=table_profile,
        execution_date=EXECUTION_DATE,
    )

    assert res_ko == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Failed,
        result="Found 100.0 rows vs. the expected 50",
    )

    table_profile_aborted = TableProfile(
        timestamp=EXECUTION_DATE.timestamp(),
    )

    res_aborted = validation_enum_registry.registry["TableRowCountToEqual"](
        TestCase(
            name="my_test_case",
            parameterValues=[TestCaseParameterValue(name="value", value=50)],
        ),
        test_definition=None,
        table_profile=table_profile_aborted,
        execution_date=EXECUTION_DATE,
    )

    assert res_aborted == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Aborted,
        result="rowCount should not be None for TableRowCountToEqual",
    )


def test_table_row_count_to_be_between():
    """
    Check TableRowCountToEqual
    """
    table_profile = TableProfile(
        timestamp=EXECUTION_DATE.timestamp(),
        rowCount=100,
    )

    res_ok = validation_enum_registry.registry["TableRowCountToBeBetween"](
        TestCase(
            name="my_test_case",
            parameterValues=[
                TestCaseParameterValue(name="minValue", value=20),
                TestCaseParameterValue(name="maxValue", value=120),
            ],
        ),
        test_definition=None,
        table_profile=table_profile,
        execution_date=EXECUTION_DATE,
    )
    assert res_ok == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Success,
        result="Found 100.0 rows vs. the expected range [20, 120].",
    )

    res_ko = validation_enum_registry.registry["TableRowCountToBeBetween"](
        TestCase(
            name="my_test_case",
            parameterValues=[
                TestCaseParameterValue(name="minValue", value=120),
                TestCaseParameterValue(name="maxValue", value=200),
            ],
        ),
        test_definition=None,
        table_profile=table_profile,
        execution_date=EXECUTION_DATE,
    )

    assert res_ko == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Failed,
        result="Found 100.0 rows vs. the expected range [120, 200].",
    )

    table_profile_aborted = TableProfile(
        timestamp=EXECUTION_DATE.timestamp(),
    )

    res_aborted = validation_enum_registry.registry["TableRowCountToBeBetween"](
        TestCase(
            name="my_test_case",
            parameterValues=[
                TestCaseParameterValue(name="minValue", value=120),
                TestCaseParameterValue(name="maxValue", value=200),
            ],
        ),
        test_definition=None,
        table_profile=table_profile_aborted,
        execution_date=EXECUTION_DATE,
    )

    assert res_aborted == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Aborted,
        result="rowCount should not be None for TableRowCountToBeBetween",
    )


def test_table_column_count_to_equal():
    """
    Check TableColumnCountToEqual
    """
    table_profile = TableProfile(
        timestamp=EXECUTION_DATE.timestamp(),
        columnCount=5,
    )

    res_ok = validation_enum_registry.registry["TableColumnCountToEqual"](
        TestCase(
            name="my_test_case",
            parameterValues=[
                TestCaseParameterValue(name="columnCount", value=5),
            ],
        ),
        test_definition=None,
        table_profile=table_profile,
        execution_date=EXECUTION_DATE,
    )
    assert res_ok == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Success,
        result="Found 5.0 columns vs. the expected 5",
    )

    res_ko = validation_enum_registry.registry["TableColumnCountToEqual"](
        TestCase(
            name="my_test_case",
            parameterValues=[
                TestCaseParameterValue(name="columnCount", value=20),
            ],
        ),
        test_definition=None,
        table_profile=table_profile,
        execution_date=EXECUTION_DATE,
    )

    assert res_ko == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Failed,
        result="Found 5.0 columns vs. the expected 20",
    )

    table_profile_aborted = TableProfile(
        timestamp=EXECUTION_DATE.timestamp(),
    )

    res_aborted = validation_enum_registry.registry["TableColumnCountToEqual"](
        TestCase(
            name="my_test_case",
            parameterValues=[
                TestCaseParameterValue(name="columnCount", value=5),
            ],
        ),
        test_definition=None,
        table_profile=table_profile_aborted,
        execution_date=EXECUTION_DATE,
    )

    assert res_aborted == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Aborted,
        result="columnCount should not be None for TableColumnCountToEqual",
    )


def test_column_values_to_be_between():
    """
    Check ColumnValuesToBeBetween
    """

    column_profile = ColumnProfile(
        min=1,
        max=3,
    )

    res_ok = validation_enum_registry.registry["columnValuesToBeBetween"](
        ColumnValuesToBeBetween(
            minValue=0,
            maxValue=3,
        ),
        col_profile=column_profile,
        execution_date=EXECUTION_DATE,
    )
    assert res_ok == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Success,
        result="Found min=1.0, max=3.0 vs. the expected min=0, max=3.",
    )

    res_ko = validation_enum_registry.registry["columnValuesToBeBetween"](
        ColumnValuesToBeBetween(
            minValue=0,
            maxValue=2,
        ),
        col_profile=column_profile,
        execution_date=EXECUTION_DATE,
    )

    assert res_ko == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Failed,
        result="Found min=1.0, max=3.0 vs. the expected min=0, max=2.",
    )

    column_profile_aborted = ColumnProfile(
        min=1,
    )

    res_aborted = validation_enum_registry.registry["columnValuesToBeBetween"](
        ColumnValuesToBeBetween(
            minValue=0,
            maxValue=3,
        ),
        col_profile=column_profile_aborted,
        execution_date=EXECUTION_DATE,
    )

    assert res_aborted == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Aborted,
        result=(
            "We expect `min` & `max` to be informed on the profiler for ColumnValuesToBeBetween"
            + " but got min=1.0, max=None."
        ),
    )


def test_column_values_to_be_unique():
    """
    Check ColumnValuesToBeUnique
    """

    column_profile = ColumnProfile(
        valuesCount=10,
        uniqueCount=10,
    )

    res_ok = validation_enum_registry.registry["columnValuesToBeUnique"](
        ColumnValuesToBeUnique(),
        col_profile=column_profile,
        execution_date=EXECUTION_DATE,
    )
    assert res_ok == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Success,
        result=(
            "Found valuesCount=10.0 vs. uniqueCount=10.0."
            + " Both counts should be equal for column values to be unique."
        ),
    )

    column_profile_ko = ColumnProfile(
        valuesCount=10,
        uniqueCount=5,
    )

    res_ko = validation_enum_registry.registry["columnValuesToBeUnique"](
        ColumnValuesToBeUnique(),
        col_profile=column_profile_ko,
        execution_date=EXECUTION_DATE,
    )

    assert res_ko == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Failed,
        result=(
            "Found valuesCount=10.0 vs. uniqueCount=5.0."
            + " Both counts should be equal for column values to be unique."
        ),
    )

    column_profile_aborted = ColumnProfile()

    res_aborted = validation_enum_registry.registry["columnValuesToBeUnique"](
        ColumnValuesToBeUnique(),
        col_profile=column_profile_aborted,
        execution_date=EXECUTION_DATE,
    )

    assert res_aborted == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Aborted,
        result=(
            "We expect `valuesCount` & `uniqueCount` to be informed on the profiler for ColumnValuesToBeUnique"
            + " but got valuesCount=None, uniqueCount=None."
        ),
    )


def test_column_values_to_be_not_null():
    """
    Check ColumnValuesToBeNotNull
    """

    column_profile = ColumnProfile(
        nullCount=0,
    )

    res_ok = validation_enum_registry.registry["columnValuesToBeNotNull"](
        ColumnValuesToBeNotNull(),
        col_profile=column_profile,
        execution_date=EXECUTION_DATE,
    )
    assert res_ok == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Success,
        result=("Found nullCount=0.0. It should be 0."),
    )

    column_profile_ko = ColumnProfile(
        nullCount=10,
    )

    res_ko = validation_enum_registry.registry["columnValuesToBeNotNull"](
        ColumnValuesToBeNotNull(),
        col_profile=column_profile_ko,
        execution_date=EXECUTION_DATE,
    )

    assert res_ko == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Failed,
        result=("Found nullCount=10.0. It should be 0."),
    )

    column_profile_aborted = ColumnProfile()

    res_aborted = validation_enum_registry.registry["columnValuesToBeNotNull"](
        ColumnValuesToBeNotNull(),
        col_profile=column_profile_aborted,
        execution_date=EXECUTION_DATE,
    )

    assert res_aborted == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Aborted,
        result=(
            "We expect `nullCount` to be informed on the profiler for ColumnValuesToBeNotNull."
        ),
    )


def test_column_value_length_to_be_between():
    """
    Check ColumnValueLengthsToBeBetween
    """
    col_profile = ColumnProfile(
        minLength=4,
        maxLength=16,
    )

    res_ok = validation_enum_registry.registry["columnValueLengthsToBeBetween"](
        ColumnValueLengthsToBeBetween(minLength=2, maxLength=20),
        col_profile=col_profile,
        execution_date=EXECUTION_DATE,
    )
    assert res_ok == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Success,
        result="Found minLength=4.0, maxLength=16.0 vs. the expected minLength=2, maxLength=20.",
    )

    res_ko = validation_enum_registry.registry["columnValueLengthsToBeBetween"](
        ColumnValueLengthsToBeBetween(minLength=10, maxLength=20),
        col_profile=col_profile,
        execution_date=EXECUTION_DATE,
    )

    assert res_ko == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Failed,
        result="Found minLength=4.0, maxLength=16.0 vs. the expected minLength=10, maxLength=20.",
    )

    col_profile_aborted = ColumnProfile(minLength=4)

    res_aborted = validation_enum_registry.registry["columnValueLengthsToBeBetween"](
        ColumnValueLengthsToBeBetween(minLength=2, maxLength=20),
        col_profile=col_profile_aborted,
        execution_date=EXECUTION_DATE,
    )

    assert res_aborted == TestCaseResult(
        timestamp=EXECUTION_DATE.timestamp(),
        testCaseStatus=TestCaseStatus.Aborted,
        result=(
            "We expect `minLength` & `maxLength` to be informed on the profiler for ColumnValueLengthsToBeBetween"
            + " but got minLength=4.0, maxLength=None."
        ),
    )
