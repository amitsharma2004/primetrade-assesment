import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import logger from '../utils/logger.js';

class Database {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private connectionString: string;
  private dbName: string;

  constructor() {
    this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    this.dbName = process.env.DB_NAME || 'assessment_db';
  }

  async connect(): Promise<void> {
    try {
      const options: MongoClientOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      this.client = new MongoClient(this.connectionString, options);
      await this.client.connect();
      
      this.db = this.client.db(this.dbName);
      
      // Test the connection
      await this.db.admin().ping();
      
      logger.info('Successfully connected to MongoDB', {
        database: this.dbName,
        connectionString: this.connectionString.replace(/\/\/.*@/, '//***:***@'), // Hide credentials in logs
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
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
}

const database = new Database();

export default database;
export { Db, MongoClient, Collection } from 'mongodb';