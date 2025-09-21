import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

// Database name
const DATABASE_NAME = 'social_feed.db';

// Singleton database instance
let databaseInstance: SQLite.SQLiteDatabase | null = null;

// Function to get database path
function getDatabasePath(): string {
  if (Platform.OS === 'web') {
    return DATABASE_NAME;
  }
  return `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
}

// Function to reset database
export async function resetDatabase(): Promise<void> {
  console.log('Starting database reset...');
  
  try {
    const dbPath = getDatabasePath();
    console.log('Database path:', dbPath);
    
    // Check if database exists
    const dbInfo = await FileSystem.getInfoAsync(dbPath);
    if (dbInfo.exists) {
      console.log('Deleting existing database...');
      await FileSystem.deleteAsync(dbPath);
      console.log('Database deleted successfully');
    } else {
      console.log('No existing database found');
    }
    
    // Create SQLite directory if it doesn't exist
    const sqliteDir = `${FileSystem.documentDirectory}SQLite`;
    const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
    if (!dirInfo.exists) {
      console.log('Creating SQLite directory...');
      await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
      console.log('SQLite directory created');
    }
    
    console.log('Database reset completed');
  } catch (error) {
    console.error('Error resetting database:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw error;
  }
}

// Function to load and execute seed file
async function loadAndExecuteSeedFile(db: SQLite.SQLiteDatabase) {
  try {
    // Load the seed file as an asset
    const seedAsset = Asset.fromModule(require('../database/seeds/initial-data.sql'));
    await seedAsset.downloadAsync();
    
    if (!seedAsset.localUri) {
      throw new Error('Failed to download seed file asset');
    }

    // Read the seed file content
    const seedContent = await FileSystem.readAsStringAsync(seedAsset.localUri);
    
    // Execute the seed content
    console.log('Executing seed data...');
    await db.execAsync(seedContent);

    // Verify seeding
    const finalUserCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM users');
    const finalPostCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM posts');
    const finalMessageCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM messages');
    
    console.log('Seeding verification:');
    console.log(`- Users: ${finalUserCount?.count}`);
    console.log(`- Posts: ${finalPostCount?.count}`);
    console.log(`- Messages: ${finalMessageCount?.count}`);
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error during database seeding:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw error;
  }
}

// Function to get database instance
async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databaseInstance) {
    databaseInstance = await SQLite.openDatabaseAsync(DATABASE_NAME, {
      useNewConnection: true // This helps prevent connection issues on Android
    });
  }
  return databaseInstance;
}

// Function to close database connection
export async function closeDatabase(): Promise<void> {
  if (databaseInstance) {
    await databaseInstance.closeAsync();
    databaseInstance = null;
  }
}

// Initialize database
export async function initDatabase() {
  console.log('Starting database initialization...');
  const db = await getDatabase();
  console.log('Database opened successfully');
  
  try {
    // Enable foreign keys
    console.log('Enabling foreign key constraints...');
    await db.execAsync('PRAGMA foreign_keys = ON;');
    console.log('Foreign key constraints enabled');
    
    // Create tables
    console.log('Creating database tables...');
    await db.execAsync(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        profile_image TEXT,
        biography TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      -- Posts table
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        author_id TEXT NOT NULL,
        content TEXT NOT NULL,
        image_uri TEXT,
        created_at TEXT NOT NULL,
        edited_at TEXT,
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        shares_count INTEGER DEFAULT 0,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Comments table
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        author_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        edited_at TEXT,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Likes table
      CREATE TABLE IF NOT EXISTS likes (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(post_id, user_id)
      );

      -- Messages table
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
      CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
      CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
      CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
      CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
      CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
    `);
    console.log('Database tables created successfully');

    // Check if database is empty
    console.log('Checking if database is empty...');
    const userCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM users');
    console.log(`Current user count: ${userCount?.count}`);
    
    // Check if database needs seeding
    console.log('Checking if database needs seeding...');
    const expectedUserIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const existingUsers = await db.getAllAsync<{ id: string }>('SELECT id FROM users');
    const existingUserIds = existingUsers.map(user => user.id);
    const missingUserIds = expectedUserIds.filter(id => !existingUserIds.includes(id));
    
    console.log(`Found ${existingUserIds.length} existing users`);
    if (missingUserIds.length > 0) {
      console.log(`Missing users with IDs: ${missingUserIds.join(', ')}`);
    }
    
    // If any expected users are missing, seed the database
    if (missingUserIds.length > 0) {
      console.log('Database is incomplete, starting seeding process...');
      await loadAndExecuteSeedFile(db);
    } else {
      console.log('Database already contains data, skipping seeding');
    }

    console.log('Database initialization completed');
    return db;
  } catch (error) {
    console.error('Error during database initialization:', error);
    // Close the database connection on error
    await closeDatabase();
    throw error;
  }
}

// Database operations
export const dbOperations = {
  // User operations
  async createUser(user: { 
    id: string; 
    username: string; 
    profileImage?: string;
    biography?: string;
  }) {
    const db = await getDatabase();
    const now = new Date().toISOString();
    try {
      await db.runAsync(
        'INSERT INTO users (id, username, profile_image, biography, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [user.id, user.username, user.profileImage || null, user.biography || null, now, now]
      );
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  },

  async getUser(userId: string) {
    const db = await getDatabase();
    try {
      return await db.getFirstAsync('SELECT * FROM users WHERE id = ?', [userId]);
    } catch (error) {
      console.error('Error in getUser:', error);
      throw error;
    }
  },

  async updateUser(userId: string, updates: {
    username?: string;
    profileImage?: string;
    biography?: string;
  }) {
    const db = await getDatabase();
    const now = new Date().toISOString();
    
    try {
      const fields = [];
      const values = [];
      
      if (updates.username !== undefined) {
        fields.push('username = ?');
        values.push(updates.username);
      }
      if (updates.profileImage !== undefined) {
        fields.push('profile_image = ?');
        values.push(updates.profileImage);
      }
      if (updates.biography !== undefined) {
        fields.push('biography = ?');
        values.push(updates.biography);
      }
      
      fields.push('updated_at = ?');
      values.push(now);
      values.push(userId);
      
      await db.runAsync(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  },

  // Post operations
  async createPost(post: {
    id: string;
    authorId: string;
    content: string;
    imageUri?: string;
  }) {
    const db = await getDatabase();
    const now = new Date().toISOString();
    
    try {
      // First verify the user exists
      const user = await db.getFirstAsync('SELECT id FROM users WHERE id = ?', [post.authorId]);
      if (!user) {
        throw new Error(`User with id ${post.authorId} not found`);
      }

      await db.runAsync(
        'INSERT INTO posts (id, author_id, content, image_uri, created_at) VALUES (?, ?, ?, ?, ?)',
        [post.id, post.authorId, post.content, post.imageUri || null, now]
      );
    } catch (error) {
      console.error('Error in createPost:', error);
      throw error;
    }
  },

  async getPosts(limit: number = 20, offset: number = 0) {
    const db = await getDatabase();
    return await db.getAllAsync(`
      SELECT 
        p.*,
        u.username as author,
        u.profile_image as author_profile_image,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
      FROM posts p
      JOIN users u ON p.author_id = u.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
  },

  async getPost(postId: string) {
    const db = await getDatabase();
    return await db.getFirstAsync(`
      SELECT 
        p.*,
        u.username as author,
        u.profile_image as author_profile_image,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `, [postId]);
  },

  async updatePost(postId: string, content: string) {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE posts SET content = ?, edited_at = ? WHERE id = ?',
      [content, now, postId]
    );
  },

  async deletePost(postId: string) {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM posts WHERE id = ?', [postId]);
  },

  // Comment operations
  async createComment(comment: {
    id: string;
    postId: string;
    authorId: string;
    content: string;
  }) {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO comments (id, post_id, author_id, content, created_at) VALUES (?, ?, ?, ?, ?)',
      [comment.id, comment.postId, comment.authorId, comment.content, now]
    );
    // Update post comments count
    await db.runAsync(
      'UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?',
      [comment.postId]
    );
  },

  async getComments(postId: string) {
    const db = await getDatabase();
    return await db.getAllAsync(`
      SELECT 
        c.*,
        u.username,
        u.profile_image
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `, [postId]);
  },

  // Like operations
  async toggleLike(postId: string, userId: string) {
    const db = await getDatabase();
    const now = new Date().toISOString();
    
    // Check if like exists
    const existingLike = await db.getFirstAsync(
      'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    if (existingLike) {
      // Unlike
      await db.runAsync(
        'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );
      await db.runAsync(
        'UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?',
        [postId]
      );
      return false;
    } else {
      // Like
      const likeId = `${postId}_${userId}_${Date.now()}`;
      await db.runAsync(
        'INSERT INTO likes (id, post_id, user_id, created_at) VALUES (?, ?, ?, ?)',
        [likeId, postId, userId, now]
      );
      await db.runAsync(
        'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?',
        [postId]
      );
      return true;
    }
  },

  async isPostLiked(postId: string, userId: string) {
    const db = await getDatabase();
    const like = await db.getFirstAsync(
      'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );
    return !!like;
  },

  // Message operations
  async createMessage(message: {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
  }) {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO messages (id, sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, ?, ?)',
      [message.id, message.senderId, message.receiverId, message.content, now]
    );
  },

  async getConversations(userId: string) {
    const db = await getDatabase();
    return await db.getAllAsync(`
      WITH LastMessages AS (
        SELECT 
          m.*,
          ROW_NUMBER() OVER (
            PARTITION BY 
              CASE 
                WHEN m.sender_id = ? THEN m.receiver_id 
                ELSE m.sender_id 
              END 
            ORDER BY m.created_at DESC
          ) as rn
        FROM messages m
        WHERE m.sender_id = ? OR m.receiver_id = ?
      )
      SELECT 
        lm.*,
        CASE 
          WHEN lm.sender_id = ? THEN u2.username
          ELSE u1.username
        END as other_username,
        CASE 
          WHEN lm.sender_id = ? THEN u2.profile_image
          ELSE u1.profile_image
        END as other_profile_image
      FROM LastMessages lm
      JOIN users u1 ON lm.sender_id = u1.id
      JOIN users u2 ON lm.receiver_id = u2.id
      WHERE lm.rn = 1
      ORDER BY lm.created_at DESC
    `, [userId, userId, userId, userId, userId]);
  },

  async getMessages(userId1: string, userId2: string) {
    const db = await getDatabase();
    return await db.getAllAsync(`
      SELECT 
        m.*,
        u1.username as sender_username,
        u1.profile_image as sender_profile_image,
        u2.username as receiver_username,
        u2.profile_image as receiver_profile_image
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN users u2 ON m.receiver_id = u2.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [userId1, userId2, userId2, userId1]);
  }
};

export async function getLikedPostIds(userId: string, postIds: string[]): Promise<string[]> {
  if (postIds.length === 0) {
    return [];
  }

  const db = await getDatabase();
  const placeholders = postIds.map(() => '?').join(', ');
  const rows = await db.getAllAsync<{ post_id: string }>(
    `SELECT post_id FROM likes WHERE user_id = ? AND post_id IN (${placeholders})`,
    [userId, ...postIds]
  );

  return rows.map(row => row.post_id);
}
