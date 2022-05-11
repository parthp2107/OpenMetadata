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
 * SQLite Database Connection Config
 */
export interface SqliteConnection {
  connectionArguments?: { [key: string]: any };
  connectionOptions?: { [key: string]: any };
  /**
   * Database of the data source. This is optional parameter, if you would like to restrict
   * the metadata reading to a single database. When left blank, OpenMetadata Ingestion
   * attempts to scan all the databases.
   */
  database?: string;
  /**
   * How to run the SQLite database. :memory: by default.
   */
  databaseMode?: string;
  /**
   * Host and port of the SQLite service. Blank for in-memory database.
   */
  hostPort?: string;
  /**
   * Password to connect to SQLite. Blank for in-memory database.
   */
  password?: string;
  /**
   * SQLAlchemy driver scheme options.
   */
  scheme?: SQLiteScheme;
  supportsMetadataExtraction?: boolean;
  supportsProfiler?: boolean;
  /**
   * Service Type
   */
  type?: SQLiteType;
  /**
   * Username to connect to SQLite. Blank for in-memory database.
   */
  username?: string;
}

/**
 * SQLAlchemy driver scheme options.
 */
export enum SQLiteScheme {
  SqlitePysqlite = 'sqlite+pysqlite',
}

/**
 * Service Type
 *
 * Service type.
 */
export enum SQLiteType {
  SQLite = 'SQLite',
}
