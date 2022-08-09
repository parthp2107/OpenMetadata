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
Register error handlers
"""

import logging

from openmetadata_managed_apis.api.app import blueprint
from openmetadata_managed_apis.api.response import ApiResponse
from openmetadata_managed_apis.api.utils import MissingArgException
from werkzeug.exceptions import HTTPException


@blueprint.app_errorhandler(Exception)
def handle_any_error(e):
    logging.exception("Wild exception")
    if isinstance(e, HTTPException):
        return ApiResponse.error(e.code, repr(e))
    return ApiResponse.server_error(repr(e))


@blueprint.app_errorhandler(MissingArgException)
def handle_missing_arg(e):
    logging.exception("Missing Argument Exception")
    return ApiResponse.bad_request(repr(e))
