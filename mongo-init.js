/**
 * MongoDB Initialization Script
 * Creates database and user for 3Play application
 */

db = db.getSiblingDB('3play');

// Create application user with readWrite permissions
db.createUser({
  user: '3play_user',
  pwd: process.env.MONGO_APP_PASSWORD || 'changeme',
  roles: [
    { role: 'readWrite', db: '3play' },
    { role: 'dbAdmin', db: '3play' }
  ]
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'username', 'password'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30
        },
        password: {
          bsonType: 'string',
          minLength: 6
        },
        isVerified: {
          bsonType: 'bool'
        },
        role: {
          enum: ['user', 'moderator', 'admin']
        }
      }
    }
  }
});

db.createCollection('videos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'user'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 100
        },
        description: {
          bsonType: 'string',
          maxLength: 5000
        },
        status: {
          enum: ['processing', 'ready', 'failed', 'private']
        }
      }
    }
  }
});

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

db.videos.createIndex({ user: 1 });
db.videos.createIndex({ status: 1 });
db.videos.createIndex({ createdAt: -1 });
db.videos.createIndex({ title: 'text', description: 'text' });
db.videos.createIndex({ tags: 1 });
db.videos.createIndex({ views: -1 });

// Insert sample data (optional, for testing)
if (process.env.NODE_ENV === 'development') {
  print('Development environment detected - skipping sample data');
}

print('3Play database initialized successfully');
