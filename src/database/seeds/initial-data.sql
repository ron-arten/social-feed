-- Initial seed data for the social feed app
-- This file contains the initial data that will be inserted when the database is first created

-- Seed users
INSERT OR IGNORE INTO users (id, username, profile_image, biography, created_at, updated_at)
VALUES 
  ('1', 'ee_person', 'assets/images/profiles/profile_1.jpg', 'What''s with that Pendo SDK huh?', datetime('now'), datetime('now')),
  ('2', 'demo_user', 'assets/images/profiles/profile_2.jpg', 'Demo user account for testing', datetime('now'), datetime('now')),
  ('3', 'test_user', 'assets/images/profiles/profile_3.jpg', 'Another test user', datetime('now'), datetime('now')),
  -- Additional users with faker-generated data
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

-- Seed posts
INSERT OR IGNORE INTO posts (id, author_id, content, image_uri, created_at, likes_count, comments_count, shares_count)
VALUES 
  -- Posts for user 1 (ee_person)
  ('1', '1', 'If we bypass the neural interface, we can get to the SSD array through the redundant SSD circuit!', 'assets/images/posts/post_1.jpg', datetime('now'), 42, 0, 0),
  ('2', '1', 'The quantum matrix is rebooting the virtual firewall through the neural network!', null, datetime('now'), 35, 0, 0),
  
  -- Posts for user 2 (demo_user)
  ('3', '2', 'A succulent roasted quail, marinated in a blend of exotic spices and served with a side of caramelized root vegetables.', 'assets/images/posts/post_2.jpg', datetime('now'), 28, 0, 0),
  ('4', '2', 'The mainframe is synthesizing the virtual protocol through the redundant interface!', null, datetime('now'), 19, 0, 0),
  
  -- Posts for user 3 (test_user)
  ('5', '3', 'The best way to predict the future is to create it.', 'assets/images/posts/post_3.jpg', datetime('now'), 45, 0, 0),
  ('6', '3', 'A delicate sea bass fillet, poached in a fragrant broth of lemongrass and ginger.', null, datetime('now'), 31, 0, 0),
  
  -- Posts for user 4 (mystic_phoenix)
  ('7', '4', 'The firewall is overriding the neural protocol through the quantum circuit!', 'assets/images/posts/post_4.jpg', datetime('now'), 38, 0, 0),
  ('8', '4', 'Success is not final, failure is not fatal: it is the courage to continue that counts.', null, datetime('now'), 47, 0, 0),
  
  -- Posts for user 5 (quantum_quasar)
  ('9', '5', 'A rich chocolate soufflé, served with a cloud of whipped cream and fresh berries.', 'assets/images/posts/post_5.jpg', datetime('now'), 33, 0, 0),
  ('10', '5', 'The matrix is synthesizing the virtual array through the redundant firewall!', null, datetime('now'), 26, 0, 0),
  
  -- Posts for user 6 (cosmic_coder)
  ('11', '6', 'The only way to do great work is to love what you do.', 'assets/images/posts/post_6.jpg', datetime('now'), 49, 0, 0),
  ('12', '6', 'A fragrant curry of tender lamb, simmered in coconut milk and aromatic spices.', null, datetime('now'), 37, 0, 0),
  
  -- Posts for user 7 (neural_ninja)
  ('13', '7', 'The protocol is bypassing the neural array through the quantum interface!', 'assets/images/posts/post_7.jpg', datetime('now'), 41, 0, 0),
  ('14', '7', 'A delicate tempura of seasonal vegetables, served with a spicy dipping sauce.', null, datetime('now'), 29, 0, 0),
  
  -- Posts for user 8 (cyber_sage)
  ('15', '8', 'The circuit is synthesizing the virtual matrix through the redundant protocol!', 'assets/images/posts/post_8.jpg', datetime('now'), 36, 0, 0),
  ('16', '8', 'Innovation distinguishes between a leader and a follower.', null, datetime('now'), 44, 0, 0),
  
  -- Posts for user 9 (binary_bard)
  ('17', '9', 'A classic beef wellington, wrapped in flaky pastry and served with a rich wine sauce.', 'assets/images/posts/post_9.jpg', datetime('now'), 39, 0, 0),
  ('18', '9', 'The interface is overriding the quantum firewall through the neural circuit!', null, datetime('now'), 27, 0, 0),
  
  -- Posts for user 10 (data_druid)
  ('19', '10', 'The future belongs to those who believe in the beauty of their dreams.', 'assets/images/posts/post_10.jpg', datetime('now'), 46, 0, 0),
  ('20', '10', 'A refreshing ceviche of fresh fish, marinated in citrus and herbs.', null, datetime('now'), 32, 0, 0);

-- Seed comments
INSERT OR IGNORE INTO comments (id, post_id, author_id, content, created_at)
VALUES 
  ('1', '1', '2', 'Welcome!', datetime('now')),
  ('2', '1', '3', 'Great first post!', datetime('now')),
  ('3', '2', '1', 'Thanks for joining!', datetime('now'));

-- Seed likes
INSERT OR IGNORE INTO likes (id, post_id, user_id, created_at)
VALUES 
  ('1', '1', '2', datetime('now')),
  ('2', '1', '3', datetime('now')),
  ('3', '2', '1', datetime('now'));

-- Update post counts
UPDATE posts 
SET 
  likes_count = (SELECT COUNT(*) FROM likes WHERE post_id = posts.id),
  comments_count = (SELECT COUNT(*) FROM comments WHERE post_id = posts.id);

-- Seed messages
INSERT OR IGNORE INTO messages (id, sender_id, receiver_id, content, created_at)
VALUES 
          -- Conversation with user 2 (demo_user)
          ('1', '2', '1', 'Hey! How are you doing? I wanted to discuss the project timeline.', datetime('now', '-2 days')),
          ('2', '1', '2', 'Hi! I''m doing great. What would you like to discuss?', datetime('now', '-2 days', '+1 hour')),
          ('3', '2', '1', 'I was thinking we could set up a meeting to go over the requirements.', datetime('now', '-2 days', '+2 hours')),
          
          -- Conversation with user 3 (test_user)
          ('4', '3', '1', 'The meeting is scheduled for tomorrow at 2 PM.', datetime('now', '-1 day')),
          ('5', '1', '3', 'Perfect, I''ll be there!', datetime('now', '-1 day', '+30 minutes')),
          
          -- Conversation with user 4 (mystic_phoenix)
          ('6', '4', '1', 'Hey! I saw your post about the neural interface. That''s fascinating!', datetime('now', '-12 hours')),
          ('7', '1', '4', 'Thanks! Yes, it''s a really interesting concept.', datetime('now', '-11 hours')),
          
           -- Conversation with user 5 (quantum_quasar)
          ('8', '5', '1', 'Would you like to collaborate on a new project?', datetime('now', '-6 hours')),
          ('9', '1', '5', 'I''d love to! What do you have in mind?', datetime('now', '-5 hours')),
          -- Conversation with user 6 (cosmic_coder)
          ('10', '6', '1', 'Your latest post about quantum computing was really insightful.', datetime('now', '-3 hours')),
          ('11', '1', '6', 'Thank you! I''ve been researching it extensively.', datetime('now', '-2 hours')),
          
          -- Conversation with user 7 (neural_ninja)
          ('12', '7', '1', 'Have you seen the latest developments in neural networks?', datetime('now', '-1 day', '+2 hours')),
          ('13', '1', '7', 'Yes, the transformer architecture is revolutionary!', datetime('now', '-1 day', '+3 hours')),
          
          -- Conversation with user 8 (cyber_sage)
          ('14', '8', '1', 'I noticed some interesting patterns in the security logs.', datetime('now', '-8 hours')),
          ('15', '1', '8', 'That''s concerning. Can you share more details?', datetime('now', '-7 hours')),
          
          -- Conversation with user 9 (binary_bard)
          ('16', '9', '1', 'Your code poetry concept is brilliant!', datetime('now', '-4 hours')),
          ('17', '1', '9', 'Thanks! It''s a fun way to make coding more creative.', datetime('now', '-3 hours')),
          
          -- Conversation with user 10 (data_druid)
          ('18', '10', '1', 'The data visualization you shared was impressive.', datetime('now', '-5 hours')),
          ('19', '1', '10', 'Glad you liked it! I used D3.js for the animations.', datetime('now', '-4 hours'));