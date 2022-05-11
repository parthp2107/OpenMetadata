/* eslint-disable @typescript-eslint/no-explicit-any */
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

/**
 * Salesforce Connection Config
 */
export interface SalesforceConnection {
  connectionArguments?: { [key: string]: any };
  connectionOptions?: { [key: string]: any };
  /**
   * Host and port of the Salesforce service.
   */
  hostPort: string;
  /**
   * Password to connect to the Salesforce.
   */
  password?: string;
  /**
   * SQLAlchemy driver scheme options.
   */
  scheme?: SalesforceScheme;
  /**
   * Salesforce Security Token.
   */
  securityToken?: string;
  /**
   * Salesforce Object Name.
   */
  sobjectName?: string;
  supportsMetadataExtraction?: boolean;
  supportsProfiler?: boolean;
  /**
   * Service Type
   */
  type?: SalesforceType;
  /**
   * Username to connect to the Salesforce. This user should have privileges to read all the
   * metadata in Redshift.
   */
  username: string;
}

/**
 * SQLAlchemy driver scheme options.
 */
export enum SalesforceScheme {
  Salesforce = 'salesforce',
}

/**
 * Service Type
 *
 * Service type.
 */
export enum SalesforceType {
  Salesforce = 'Salesforce',
}
