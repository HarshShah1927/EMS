import { MongoClient, Db } from 'mongodb';

let client: MongoClient;
let db: Db;

const MONGODB_URI = import.meta.env.VITE_MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the VITE_MONGODB_URI environment variable');
}

export async function connectDB(): Promise<{ client: MongoClient; db: Db }> {
  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      await client.connect();
      console.log('Connected to MongoDB Atlas');
    }

    if (!db) {
      db = client.db('employee_management');
    }

    // Create indexes for better performance
    await createIndexes();

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function createIndexes() {
  try {
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ employeeId: 1 }, { sparse: true });
    
    // Employees collection indexes
    await db.collection('employees').createIndex({ employeeId: 1 }, { unique: true });
    await db.collection('employees').createIndex({ email: 1 }, { unique: true });
    await db.collection('employees').createIndex({ department: 1 });
    
    // Attendance collection indexes
    await db.collection('attendance').createIndex({ employeeId: 1, date: 1 }, { unique: true });
    await db.collection('attendance').createIndex({ date: 1 });
    
    // Leave requests collection indexes
    await db.collection('leave_requests').createIndex({ employeeId: 1 });
    await db.collection('leave_requests').createIndex({ status: 1 });
    await db.collection('leave_requests').createIndex({ startDate: 1, endDate: 1 });
    
    // Salary collection indexes
    await db.collection('salaries').createIndex({ employeeId: 1, month: 1, year: 1 }, { unique: true });
    await db.collection('salaries').createIndex({ status: 1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

export async function closeDB() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}