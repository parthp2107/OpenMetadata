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
Models to map tests and validations from
JSON workflows to the profiler
"""
from typing import List, Optional

from metadata.config.common import ConfigModel
from metadata.generated.schema.tests.testCase import TestCaseParameterValue
from metadata.generated.schema.type.basic import FullyQualifiedEntityName, Markdown


class TestCase(ConfigModel):
    """
    cli testcases
    """

    name: str
    description: Optional[Markdown] = "Test suite description"
    testDefinitionName: str
    fullyQualifiedName: FullyQualifiedEntityName
    parameterValues: List[TestCaseParameterValue]


class TestDef(ConfigModel):
    """
    Table test definition

    We expect:
    - table name
    - Profile sample
    - List of table tests
    - List of column tests

    We will run a PUT using the info given in the JSON
    workflow to update the Table definition based
    on the incoming properties.
    """

    testCase: Optional[List[TestCase]] = None
    profile_sample: Optional[float] = None
    partition_field: Optional[str] = None
    partition_query_duration: Optional[int] = 1
    partition_values: Optional[List] = None
    profile_sample_query: Optional[str] = None
    clear_sample_query_from_entity: bool = False


class TestSuite(ConfigModel):
    """
    Config test definition
    """

    name: str  # Test Suite name
    description: Optional[str] = "Test suite description"
    scheduleInterval: Optional[str]
    testCases: List[TestCase]
