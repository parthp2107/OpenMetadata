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
 * Metabase Connection Config
 */
export interface MetabaseConnection {
  /**
   * Database Service Name for creation of lineage
   */
  dbServiceName?: string;
  /**
   * Host and Port of the Metabase instance.
   */
  hostPort: string;
  /**
   * Password to connect to Metabase.
   */
  password?: string;
  supportsMetadataExtraction?: boolean;
  /**
   * Service Type
   */
  type?: MetabaseType;
  /**
   * Username to connect to Metabase. This user should have privileges to read all the
   * metadata in Metabase.
   */
  username: string;
}

/**
 * Service Type
 *
 * Metabase service type
 */
export enum MetabaseType {
  Metabase = 'Metabase',
}
