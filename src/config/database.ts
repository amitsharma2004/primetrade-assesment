
import { MongoClient, Db, MongoClientOptions, ServerApiVersion } from 'mongodb';
import logger from '../utils/logger.js';

class Database {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private connectionString: string;
  private dbName: string;

  constructor() {
    // Use the Atlas connection string from environment or fallback to the provided one
    this.connectionString = process.env.MONGODB_URI || "mongodb+srv://akps1440236_db_user:aEwXwtchVKdEisSY@cluster0.948ntw7.mongodb.net/?appName=Cluster0";
    this.dbName = process.env.DB_NAME || 'assessment_db';
  }

  /**
   * Connect to MongoDB
   */
  async connect(): Promise<void> {
    try {
      const options: MongoClientOptions = {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      this.client = new MongoClient(this.connectionString, options);
      await this.client.connect();
      
      this.db = this.client.db(this.dbName);
      
      // Test the connection
      await this.db.admin().ping();
      
      logger.info('Successfully connected to MongoDB Atlas', {
        database: this.dbName,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Failed to connect to MongoDB', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
        logger.info('Disconnected from MongoDB', {
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('Error disconnecting from MongoDB', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Get database instance
   */
  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Get MongoDB client instance
   */
  getClient(): MongoClient {
    if (!this.client) {
      throw new Error('Database client not available. Call connect() first.');
    }
    return this.client;
  }

  /**
   * Check if database is connected
   */
  isConnected(): boolean {
    return this.client !== null && this.db !== null;
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(): Promise<{
    connected: boolean;
    database: string;
    serverStatus?: any;
  }> {
    try {
      if (!this.isConnected()) {
        return {
          connected: false,
          database: this.dbName
        };
      }

      const serverStatus = await this.db!.admin().serverStatus();
      
      return {
        connected: true,
        database: this.dbName,
        serverStatus: {
          version: serverStatus.version,
          uptime: serverStatus.uptime,
          connections: serverStatus.connections
        }
      };
    } catch (error) {
      logger.error('Error getting connection status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return {
        connected: false,
        database: this.dbName
      };
    }
  }

  /**
   * Create indexes for collections
   */
  async createIndexes(): Promise<void> {
    try {
      if (!this.db) {
        throw new Error('Database not connected');
      }

      // Create indexes for users collection
      const usersCollection = this.db.collection('users');
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      await usersCollection.createIndex({ createdAt: 1 });
      await usersCollection.createIndex({ isActive: 1 });

      logger.info('Database indexes created successfully', {
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error creating database indexes', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Health check for database
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.db) {
        return false;
      }
      
      await this.db.admin().ping();
      return true;
    } catch (error) {
      logger.error('Database health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }
}

// Create and export a singleton instance
const database = new Database();

export default database;

// Export types for use in other files
export { Db, MongoClient, Collection } from 'mongodb';
