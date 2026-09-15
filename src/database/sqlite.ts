import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CREATE_TABLES_SQL } from './schema';

export interface IDatabase {
  execAsync(query: string): Promise<void>;
  runAsync(statement: string, ...params: any[]): Promise<{ changes: number; lastInsertRowId: number }>;
  getAllAsync<T = any>(statement: string, ...params: any[]): Promise<T[]>;
  getFirstAsync<T = any>(statement: string, ...params: any[]): Promise<T | null>;
}

/**
 * Robust Persistent AsyncStorage Database Fallback
 * Used seamlessly when native ExpoSQLite module is absent (e.g. Standard Expo Go mobile client).
 */
class PersistentDatabaseFallback implements IDatabase {
  private tables: Map<string, any[]> = new Map();
  private loaded = false;

  private tableNames = [
    'local_game_results',
    'local_cognitive_scores',
    'local_memories',
    'local_tasks',
    'local_user_profile',
    'sync_queue',
  ];

  constructor() {
    for (const name of this.tableNames) {
      this.tables.set(name, []);
    }
  }

  async init(): Promise<void> {
    if (this.loaded) return;
    try {
      for (const name of this.tableNames) {
        const stored = await AsyncStorage.getItem(`@smriticare_db_${name}`);
        if (stored) {
          try {
            this.tables.set(name, JSON.parse(stored));
          } catch {
            this.tables.set(name, []);
          }
        } else {
          this.tables.set(name, []);
        }
      }
      this.loaded = true;
    } catch (e) {
      console.warn('PersistentDatabaseFallback: error reading AsyncStorage', e);
      this.loaded = true;
    }
  }

  private async persistTable(tableName: string): Promise<void> {
    try {
      const data = this.tables.get(tableName) || [];
      await AsyncStorage.setItem(`@smriticare_db_${tableName}`, JSON.stringify(data));
    } catch (e) {
      console.warn(`PersistentDatabaseFallback: error persisting table ${tableName}`, e);
    }
  }

  async execAsync(query: string): Promise<void> {
    await this.init();
    // Tables are already initialized
  }

  async runAsync(statement: string, ...params: any[]): Promise<{ changes: number; lastInsertRowId: number }> {
    await this.init();
    const cleanSql = statement.replace(/\s+/g, ' ').trim();

    // INSERT
    const insertMatch = cleanSql.match(/^INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (insertMatch) {
      const tableName = insertMatch[1];
      const colNames = insertMatch[2].split(',').map((c) => c.trim());
      const valPlaceholders = insertMatch[3].split(',').map((v) => v.trim());

      let paramIdx = 0;
      const row: Record<string, any> = {};

      for (let i = 0; i < colNames.length; i++) {
        const col = colNames[i];
        const placeholder = valPlaceholders[i];
        if (placeholder === '?') {
          row[col] = params[paramIdx++];
        } else {
          // Literal value (e.g. 0, 'PENDING', NULL)
          const num = Number(placeholder);
          if (!isNaN(num)) {
            row[col] = num;
          } else if (placeholder.toUpperCase() === 'NULL') {
            row[col] = null;
          } else {
            row[col] = placeholder.replace(/^['"]|['"]$/g, '');
          }
        }
      }

      const tableData = this.tables.get(tableName) || [];
      // If row with same id already exists (upsert simulation)
      if (row.id) {
        const existingIdx = tableData.findIndex((r) => r.id === row.id);
        if (existingIdx >= 0) {
          tableData[existingIdx] = { ...tableData[existingIdx], ...row };
        } else {
          tableData.push(row);
        }
      } else if (tableName === 'local_user_profile' && row.user_id) {
        const existingIdx = tableData.findIndex((r) => r.user_id === row.user_id);
        if (existingIdx >= 0) {
          tableData[existingIdx] = { ...tableData[existingIdx], ...row };
        } else {
          tableData.push(row);
        }
      } else {
        tableData.push(row);
      }

      this.tables.set(tableName, tableData);
      await this.persistTable(tableName);
      return { changes: 1, lastInsertRowId: tableData.length };
    }

    // UPDATE
    const updateMatch = cleanSql.match(/^UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
    if (updateMatch) {
      const tableName = updateMatch[1];
      const setClause = updateMatch[2];
      const whereClause = updateMatch[3];

      const tableData = this.tables.get(tableName) || [];
      let paramIdx = 0;

      // Extract assignments
      const assignments = setClause.split(',').map((item) => item.trim());
      const updatesToApply: Record<string, any> = {};
      let incrementRetryCount = false;

      for (const assign of assignments) {
        const [col, val] = assign.split('=').map((s) => s.trim());
        if (val === '?') {
          updatesToApply[col] = params[paramIdx++];
        } else if (val.toLowerCase().includes('retry_count + 1')) {
          incrementRetryCount = true;
        } else {
          const num = Number(val);
          if (!isNaN(num)) {
            updatesToApply[col] = num;
          } else if (val.toUpperCase() === 'NULL') {
            updatesToApply[col] = null;
          } else {
            updatesToApply[col] = val.replace(/^['"]|['"]$/g, '');
          }
        }
      }

      // Filter rows
      let updatedCount = 0;
      for (let i = 0; i < tableData.length; i++) {
        let matches = true;
        if (whereClause) {
          matches = this.evaluateWhere(tableData[i], whereClause, params, paramIdx);
        }

        if (matches) {
          const row = { ...tableData[i], ...updatesToApply };
          if (incrementRetryCount) {
            row.retry_count = (row.retry_count || 0) + 1;
          }
          tableData[i] = row;
          updatedCount++;
        }
      }

      this.tables.set(tableName, tableData);
      await this.persistTable(tableName);
      return { changes: updatedCount, lastInsertRowId: 0 };
    }

    // DELETE
    const deleteMatch = cleanSql.match(/^DELETE\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+))?$/i);
    if (deleteMatch) {
      const tableName = deleteMatch[1];
      const whereClause = deleteMatch[2];
      let tableData = this.tables.get(tableName) || [];

      if (!whereClause) {
        const changes = tableData.length;
        this.tables.set(tableName, []);
        await this.persistTable(tableName);
        return { changes, lastInsertRowId: 0 };
      }

      const initialLen = tableData.length;
      tableData = tableData.filter((r) => !this.evaluateWhere(r, whereClause, params, 0));
      this.tables.set(tableName, tableData);
      await this.persistTable(tableName);
      return { changes: initialLen - tableData.length, lastInsertRowId: 0 };
    }

    return { changes: 0, lastInsertRowId: 0 };
  }

  async getAllAsync<T = any>(statement: string, ...params: any[]): Promise<T[]> {
    await this.init();
    const cleanSql = statement.replace(/\s+/g, ' ').trim();

    // SELECT COUNT(*) ...
    if (/SELECT\s+COUNT\(\*\)\s+as\s+count/i.test(cleanSql)) {
      const tableMatch = cleanSql.match(/FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+))?/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const whereClause = tableMatch[2];
        const tableData = this.tables.get(tableName) || [];
        if (!whereClause) {
          return [{ count: tableData.length }] as any[];
        }
        const filtered = tableData.filter((r) => this.evaluateWhere(r, whereClause, params, 0));
        return [{ count: filtered.length }] as any[];
      }
      return [{ count: 0 }] as any[];
    }

    // Normal SELECT
    const selectMatch = cleanSql.match(/SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(.+?))?$/i);
    if (!selectMatch) {
      return [];
    }

    const selectCols = selectMatch[1].trim();
    const tableName = selectMatch[2].trim();
    const whereClause = selectMatch[3] ? selectMatch[3].trim() : undefined;
    const orderByClause = selectMatch[4] ? selectMatch[4].trim() : undefined;
    const limitClause = selectMatch[5] ? selectMatch[5].trim() : undefined;

    let rows = [...(this.tables.get(tableName) || [])];

    // Filter
    if (whereClause) {
      rows = rows.filter((r) => this.evaluateWhere(r, whereClause, params, 0));
    }

    // Sort
    if (orderByClause) {
      const [orderCol, orderDir] = orderByClause.split(/\s+/);
      const isDesc = orderDir && orderDir.toUpperCase() === 'DESC';
      rows.sort((a, b) => {
        const valA = a[orderCol] ?? '';
        const valB = b[orderCol] ?? '';
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    // Limit
    if (limitClause) {
      let limitNum = Number(limitClause);
      if (limitClause === '?') {
        const limitParam = params[params.length - 1];
        if (typeof limitParam === 'number') limitNum = limitParam;
      }
      if (!isNaN(limitNum) && limitNum > 0) {
        rows = rows.slice(0, limitNum);
      }
    }

    // Map column aliases (e.g. user_id as userId)
    if (selectCols !== '*') {
      const colMappers = selectCols.split(',').map((c) => {
        const parts = c.trim().split(/\s+as\s+/i);
        const orig = parts[0].trim();
        const alias = parts[1] ? parts[1].trim() : orig;
        return { orig, alias };
      });

      return rows.map((r) => {
        const mapped: Record<string, any> = {};
        for (const m of colMappers) {
          mapped[m.alias] = r[m.orig] !== undefined ? r[m.orig] : r[m.alias];
        }
        return mapped as T;
      });
    }

    return rows as T[];
  }

  async getFirstAsync<T = any>(statement: string, ...params: any[]): Promise<T | null> {
    const all = await this.getAllAsync<T>(statement, ...params);
    return all.length > 0 ? all[0] : null;
  }

  private evaluateWhere(row: Record<string, any>, whereClause: string, params: any[], paramOffset: number): boolean {
    // Strip trailing ORDER BY / LIMIT if accidentally matched
    const cleanWhere = whereClause.split(/\s+ORDER\s+BY/i)[0].split(/\s+LIMIT/i)[0].trim();
    const conditions = cleanWhere.split(/\s+AND\s+/i);

    let pIdx = paramOffset;
    for (const cond of conditions) {
      const match = cond.trim().match(/^([a-zA-Z0-9_]+)\s*(=|!=|<>|<|>|<=|>=)\s*(.+)$/i);
      if (!match) continue;

      const col = match[1];
      const op = match[2];
      const rawVal = match[3].trim();

      let targetVal: any;
      if (rawVal === '?') {
        targetVal = params[pIdx++];
      } else {
        const num = Number(rawVal);
        if (!isNaN(num)) {
          targetVal = num;
        } else if (rawVal.toUpperCase() === 'NULL') {
          targetVal = null;
        } else {
          targetVal = rawVal.replace(/^['"]|['"]$/g, '');
        }
      }

      const actualVal = row[col];
      if (op === '=') {
        if (String(actualVal) !== String(targetVal)) return false;
      } else if (op === '!=' || op === '<>') {
        if (String(actualVal) === String(targetVal)) return false;
      } else if (op === '<') {
        if (!(actualVal < targetVal)) return false;
      } else if (op === '>') {
        if (!(actualVal > targetVal)) return false;
      }
    }
    return true;
  }
}

let dbInstance: IDatabase | null = null;
let isInitialized = false;

/**
 * Initializes the SQLite database or transparent persistent fallback.
 */
export async function initDatabase(): Promise<IDatabase> {
  if (isInitialized && dbInstance) {
    return dbInstance;
  }

  // Try loading native expo-sqlite safely without crashing Expo Go
  try {
    // Safe dynamic require so Expo Go doesn't throw at bundle load
    const SQLite = require('expo-sqlite');
    if (SQLite && typeof SQLite.openDatabaseAsync === 'function') {
      const db = await SQLite.openDatabaseAsync('smriticare.db');
      await db.execAsync(CREATE_TABLES_SQL);
      dbInstance = db;
      isInitialized = true;
      return db;
    }
  } catch (error: any) {
    console.log('SmritiCare: ExpoSQLite native module not present, using persistent storage engine.');
  }

  // Use persistent AsyncStorage storage engine for Expo Go & Web
  const fallback = new PersistentDatabaseFallback();
  await fallback.init();
  dbInstance = fallback;
  isInitialized = true;
  return fallback;
}

/**
 * Get the current database instance.
 */
export async function getDatabase(): Promise<IDatabase> {
  if (!isInitialized || !dbInstance) {
    return initDatabase();
  }
  return dbInstance;
}
