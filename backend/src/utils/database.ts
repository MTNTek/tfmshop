import { AppDataSource } from '../config/database';
import { QueryRunner } from 'typeorm';

/**
 * Database utility functions for common operations
 */
export class DatabaseUtils {
  /**
   * Execute a function within a database transaction
   * @param fn Function to execute within transaction
   * @returns Promise with the result of the function
   */
  static async withTransaction<T>(
    fn: (queryRunner: QueryRunner) => Promise<T>
  ): Promise<T> {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      const result = await fn(queryRunner);
      
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Check if a table exists in the database
   * @param tableName Name of the table to check
   * @returns Promise<boolean> indicating if table exists
   */
  static async tableExists(tableName: string): Promise<boolean> {
    try {
      const result = await AppDataSource.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [tableName]
      );
      return result[0]?.exists || false;
    } catch (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
  }

  /**
   * Get database connection info
   * @returns Object with connection details
   */
  static getConnectionInfo() {
    if (!AppDataSource.isInitialized) {
      return null;
    }

    const options = AppDataSource.options;
    return {
      type: options.type,
      host: 'host' in options ? options.host : undefined,
      port: 'port' in options ? options.port : undefined,
      database: 'database' in options ? options.database : undefined,
      isConnected: AppDataSource.isInitialized,
    };
  }

  /**
   * Execute raw SQL query safely
   * @param query SQL query string
   * @param parameters Query parameters
   * @returns Promise with query result
   */
  static async executeQuery(query: string, parameters?: any[]): Promise<any> {
    try {
      return await AppDataSource.query(query, parameters);
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error(`Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all data from specified tables (useful for testing)
   * @param tableNames Array of table names to clear
   */
  static async clearTables(tableNames: string[]): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Disable foreign key checks temporarily
      await queryRunner.query('SET session_replication_role = replica;');

      // Clear each table
      for (const tableName of tableNames) {
        await queryRunner.query(`TRUNCATE TABLE "${tableName}" CASCADE;`);
      }

      // Re-enable foreign key checks
      await queryRunner.query('SET session_replication_role = DEFAULT;');

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}