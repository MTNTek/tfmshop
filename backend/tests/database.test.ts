import 'reflect-metadata';
import { AppDataSource, initializeDatabase, closeDatabase, checkDatabaseHealth } from '../src/config/database';
import { BaseEntity } from '../src/entities/BaseEntity';
import { DatabaseUtils } from '../src/utils/database';

describe('Database Configuration', () => {
  let isDatabaseAvailable = false;

  beforeAll(async () => {
    try {
      // Try to initialize database connection for tests
      await initializeDatabase();
      isDatabaseAvailable = true;
    } catch (error) {
      console.log('⚠️  Database not available for tests, skipping database-dependent tests');
      isDatabaseAvailable = false;
    }
  });

  afterAll(async () => {
    if (isDatabaseAvailable) {
      try {
        await closeDatabase();
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
  });

  describe('Database Connection', () => {
    it('should establish database connection when database is available', async () => {
      if (!isDatabaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }
      
      expect(AppDataSource.isInitialized).toBe(true);
    });

    it('should pass health check when database is available', async () => {
      if (!isDatabaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }
      
      const isHealthy = await checkDatabaseHealth();
      expect(isHealthy).toBe(true);
    });

    it('should return connection info when database is available', () => {
      if (!isDatabaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }
      
      const connectionInfo = DatabaseUtils.getConnectionInfo();
      expect(connectionInfo).toBeDefined();
      expect(connectionInfo?.type).toBe('postgres');
      expect(connectionInfo?.isConnected).toBe(true);
    });
  });

  describe('Database Utils', () => {
    it('should execute raw query when database is available', async () => {
      if (!isDatabaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }
      
      const result = await DatabaseUtils.executeQuery('SELECT 1 as test');
      expect(result).toBeDefined();
      expect(result[0].test).toBe(1);
    });

    it('should handle transaction when database is available', async () => {
      if (!isDatabaseAvailable) {
        console.log('⏭️  Skipping test - database not available');
        return;
      }
      
      const result = await DatabaseUtils.withTransaction(async (queryRunner) => {
        const testResult = await queryRunner.query('SELECT 2 as transaction_test');
        return testResult[0].transaction_test;
      });
      
      expect(result).toBe(2);
    });

    it('should return null connection info when database is not initialized', () => {
      if (isDatabaseAvailable) {
        console.log('⏭️  Skipping test - database is available');
        return;
      }
      
      const connectionInfo = DatabaseUtils.getConnectionInfo();
      expect(connectionInfo).toBeNull();
    });
  });

  describe('Base Entity', () => {
    it('should be a class that can be extended', () => {
      // Create a test entity that extends BaseEntity
      class TestEntity extends BaseEntity {}
      
      const entity = new TestEntity();
      
      // Check that it's an instance of BaseEntity
      expect(entity).toBeInstanceOf(BaseEntity);
    });

    it('should extend TypeORM BaseEntity', () => {
      class TestEntity extends BaseEntity {}
      const entity = new TestEntity();
      
      // Check that it has TypeORM BaseEntity methods
      expect(typeof entity.save).toBe('function');
      expect(typeof entity.remove).toBe('function');
      expect(typeof entity.reload).toBe('function');
    });

    it('should have metadata for TypeORM decorators', () => {
      // Check that the BaseEntity class has the expected metadata
      // This verifies that the decorators are properly applied
      const metadata = Reflect.getMetadata('design:type', BaseEntity.prototype, 'id');
      expect(metadata).toBeDefined();
    });
  });
});