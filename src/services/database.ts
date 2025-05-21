import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Database name
const DATABASE_NAME = 'social_feed.db';

// Initialize database
export async function initDatabase() {
  console.log('Starting database initialization...');
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  console.log('Database opened successfully');
  
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
    try {
      // Execute the seed data directly
      console.log('Seeding users...');
      await db.execAsync(`
        -- Seed users
        INSERT OR IGNORE INTO users (id, username, profile_image, biography, created_at, updated_at)
        VALUES 
          ('1', 'ee_person', 'assets/images/profiles/profile_1.jpg', 'What does it take to install PendoSDK?', datetime('now'), datetime('now')),
          ('2', 'demo_user', 'assets/images/profiles/profile_2.jpg', 'Demo user account for testing', datetime('now'), datetime('now')),
          ('3', 'test_user', 'assets/images/profiles/profile_3.jpg', 'Another test user', datetime('now'), datetime('now')),
          ('4', 'mystic_phoenix', 'assets/images/profiles/profile_4.jpg', 'Digital nomad exploring the intersection of technology and creativity. Always learning, always growing.', datetime('now'), datetime('now')),
          ('5', 'quantum_quasar', 'assets/images/profiles/profile_5.jpg', 'Tech enthusiast and coffee addict. Building the future one line of code at a time.', datetime('now'), datetime('now')),
          ('6', 'cosmic_coder', 'assets/images/profiles/profile_6.jpg', 'Full-stack developer by day, amateur astronomer by night. Always looking up.', datetime('now'), datetime('now')),
          ('7', 'neural_ninja', 'assets/images/profiles/profile_7.jpg', 'AI researcher and martial arts practitioner. Finding balance in chaos.', datetime('now'), datetime('now')),
          ('8', 'cyber_sage', 'assets/images/profiles/profile_8.jpg', 'Cybersecurity expert and philosophy enthusiast. Protecting digital frontiers.', datetime('now'), datetime('now')),
          ('9', 'binary_bard', 'assets/images/profiles/profile_9.jpg', 'Code poet and music lover. Turning algorithms into art.', datetime('now'), datetime('now')),
          ('10', 'data_druid', 'assets/images/profiles/profile_10.jpg', 'Data scientist and nature enthusiast. Finding patterns in chaos.', datetime('now'), datetime('now')),
          ('11', 'pixel_pioneer', 'assets/images/profiles/profile_11.jpg', 'UI/UX designer and digital artist. Creating beautiful experiences.', datetime('now'), datetime('now')),
          ('12', 'code_crusader', 'assets/images/profiles/profile_12.jpg', 'Software engineer and problem solver. Turning coffee into code.', datetime('now'), datetime('now')),
          ('13', 'tech_titan', 'assets/images/profiles/profile_13.jpg', 'Tech entrepreneur and innovation enthusiast. Building the future.', datetime('now'), datetime('now'));
      `);
      console.log('Users seeded successfully');

      console.log('Seeding posts...');
      await db.execAsync(`
        -- Seed posts
        INSERT OR IGNORE INTO posts (id, author_id, content, image_uri, created_at, likes_count, comments_count, shares_count)
        VALUES 
          ('1', '1', 'If we bypass the neural interface, we can get to the SSD array through the redundant SSD circuit!', 'assets/images/posts/post_1.jpg', datetime('now'), 42, 0, 0),
          ('2', '1', 'The quantum matrix is rebooting the virtual firewall through the neural network!', null, datetime('now'), 35, 0, 0),
          ('3', '2', 'A succulent roasted quail, marinated in a blend of exotic spices and served with a side of caramelized root vegetables.', 'assets/images/posts/post_2.jpg', datetime('now'), 28, 0, 0),
          ('4', '2', 'The mainframe is synthesizing the virtual protocol through the redundant interface!', null, datetime('now'), 19, 0, 0),
          ('5', '3', 'The best way to predict the future is to create it.', 'assets/images/posts/post_3.jpg', datetime('now'), 45, 0, 0),
          ('6', '3', 'A delicate sea bass fillet, poached in a fragrant broth of lemongrass and ginger.', null, datetime('now'), 31, 0, 0),
          ('7', '4', 'The firewall is overriding the neural protocol through the quantum circuit!', 'assets/images/posts/post_4.jpg', datetime('now'), 38, 0, 0),
          ('8', '4', 'Success is not final, failure is not fatal: it is the courage to continue that counts.', null, datetime('now'), 47, 0, 0),
          ('9', '5', 'A rich chocolate soufflé, served with a cloud of whipped cream and fresh berries.', 'assets/images/posts/post_5.jpg', datetime('now'), 33, 0, 0),
          ('10', '5', 'The matrix is synthesizing the virtual array through the redundant firewall!', null, datetime('now'), 26, 0, 0),
          ('11', '6', 'The only way to do great work is to love what you do.', 'assets/images/posts/post_6.jpg', datetime('now'), 49, 0, 0),
          ('12', '6', 'A fragrant curry of tender lamb, simmered in coconut milk and aromatic spices.', null, datetime('now'), 37, 0, 0),
          ('13', '7', 'The protocol is bypassing the neural array through the quantum interface!', 'assets/images/posts/post_7.jpg', datetime('now'), 41, 0, 0),
          ('14', '7', 'A delicate tempura of seasonal vegetables, served with a spicy dipping sauce.', null, datetime('now'), 29, 0, 0),
          ('15', '8', 'The circuit is synthesizing the virtual matrix through the redundant protocol!', 'assets/images/posts/post_8.jpg', datetime('now'), 36, 0, 0),
          ('16', '8', 'Innovation distinguishes between a leader and a follower.', null, datetime('now'), 44, 0, 0),
          ('17', '9', 'A classic beef wellington, wrapped in flaky pastry and served with a rich wine sauce.', 'assets/images/posts/post_9.jpg', datetime('now'), 39, 0, 0),
          ('18', '9', 'The interface is overriding the quantum firewall through the neural circuit!', null, datetime('now'), 27, 0, 0),
          ('19', '10', 'The future belongs to those who believe in the beauty of their dreams.', 'assets/images/posts/post_10.jpg', datetime('now'), 46, 0, 0),
          ('20', '10', 'A refreshing ceviche of fresh fish, marinated in citrus and herbs.', null, datetime('now'), 32, 0, 0);
      `);
      console.log('Posts seeded successfully');

      console.log('Seeding messages...');
      await db.execAsync(`
        -- Seed messages
        INSERT OR IGNORE INTO messages (id, sender_id, receiver_id, content, created_at)
        VALUES 
          ('1', '2', '1', 'Hey! How are you doing? I wanted to discuss the project timeline.', datetime('now', '-2 days')),
          ('2', '1', '2', 'Hi! I''m doing great. What would you like to discuss?', datetime('now', '-2 days', '+1 hour')),
          ('3', '2', '1', 'I was thinking we could set up a meeting to go over the requirements.', datetime('now', '-2 days', '+2 hours')),
          ('4', '3', '1', 'The meeting is scheduled for tomorrow at 2 PM.', datetime('now', '-1 day')),
          ('5', '1', '3', 'Perfect, I''ll be there!', datetime('now', '-1 day', '+30 minutes')),
          ('6', '4', '1', 'Hey! I saw your post about the neural interface. That''s fascinating!', datetime('now', '-12 hours')),
          ('7', '1', '4', 'Thanks! Yes, it''s a really interesting concept.', datetime('now', '-11 hours')),
          ('8', '5', '1', 'Would you like to collaborate on a new project?', datetime('now', '-6 hours')),
          ('9', '1', '5', 'I''d love to! What do you have in mind?', datetime('now', '-5 hours')),
          ('10', '6', '1', 'Your latest post about quantum computing was really insightful.', datetime('now', '-3 hours'));
      `);
      console.log('Messages seeded successfully');

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
      throw error; // Re-throw to handle it in the context
    }
  } else {
    console.log('Database already contains data, skipping seeding');
  }

  console.log('Database initialization completed');
  return db;
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
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO users (id, username, profile_image, biography, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, user.username, user.profileImage || null, user.biography || null, now, now]
    );
  },

  async getUser(userId: string) {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    return await db.getFirstAsync('SELECT * FROM users WHERE id = ?', [userId]);
  },

  async updateUser(userId: string, updates: {
    username?: string;
    profileImage?: string;
    biography?: string;
  }) {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    const now = new Date().toISOString();
    
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
  },

  // Post operations
  async createPost(post: {
    id: string;
    authorId: string;
    content: string;
    imageUri?: string;
  }) {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
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
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
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
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
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
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE posts SET content = ?, edited_at = ? WHERE id = ?',
      [content, now, postId]
    );
  },

  async deletePost(postId: string) {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await db.runAsync('DELETE FROM posts WHERE id = ?', [postId]);
  },

  // Comment operations
  async createComment(comment: {
    id: string;
    postId: string;
    authorId: string;
    content: string;
  }) {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
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
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
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
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
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
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
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
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    const now = new Date().toISOString();
    await db.runAsync(
      'INSERT INTO messages (id, sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, ?, ?)',
      [message.id, message.senderId, message.receiverId, message.content, now]
    );
  },

  async getConversations(userId: string) {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
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
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
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