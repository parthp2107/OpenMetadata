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
 * Trino Connection Config
 */
export interface TrinoConnection {
  /**
   * Catalog of the data source.
   */
  catalog?: string;
  connectionArguments?: { [key: string]: any };
  connectionOptions?: { [key: string]: any };
  /**
   * Database of the data source. This is optional parameter, if you would like to restrict
   * the metadata reading to a single database. When left blank, OpenMetadata Ingestion
   * attempts to scan all the databases in the selected catalog.
   */
  database?: string;
  /**
   * Host and port of the Trino service.
   */
  hostPort: string;
  /**
   * URL parameters for connection to the Trino data source
   */
  params?: { [key: string]: string };
  /**
   * Password to connect to Trino.
   */
  password?: string;
  /**
   * Proxies for the connection to Trino data source
   */
  proxies?: { [key: string]: string };
  /**
   * SQLAlchemy driver scheme options.
   */
  scheme?: TrinoScheme;
  supportsMetadataExtraction?: boolean;
  supportsProfiler?: boolean;
  /**
   * Service Type
   */
  type?: TrinoType;
  /**
   * Username to connect to Trino. This user should have privileges to read all the metadata
   * in Trino.
   */
  username: string;
}

/**
 * SQLAlchemy driver scheme options.
 */
export enum TrinoScheme {
  Trino = 'trino',
}

/**
 * Service Type
 *
 * Service type.
 */
export enum TrinoType {
  Trino = 'Trino',
}
