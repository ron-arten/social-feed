import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../contexts/user-context';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  senderProfileImage?: any;
  receiverProfileImage?: any;
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    username: string;
    profileImage?: any;
  }[];
  lastMessage: Message;
}

// Mock data for demonstration
const mockConversations: Conversation[] = [
  {
    id: '1',
    participants: [
      {
        id: 'user1',
        username: 'ee_person',
        profileImage: require('../../images/profileImage/christian-buehner-DItYlc26zVI-unsplash.jpg'),
      },
      {
        id: 'user2',
        username: 'john_doe',
        profileImage: undefined,
      },
    ],
    lastMessage: {
      id: 'msg1',
      senderId: 'user2',
      receiverId: 'user1',
      content: 'Hey! How are you doing? I wanted to discuss the project timeline.',
      timestamp: '2024-03-20T10:30:00Z',
    },
  },
  {
    id: '2',
    participants: [
      {
        id: 'user1',
        username: 'ee_person',
        profileImage: require('../../images/profileImage/christian-buehner-DItYlc26zVI-unsplash.jpg'),
      },
      {
        id: 'user3',
        username: 'sarah_smith',
        profileImage: undefined,
      },
    ],
    lastMessage: {
      id: 'msg2',
      senderId: 'user1',
      receiverId: 'user3',
      content: 'The meeting is scheduled for tomorrow at 2 PM.',
      timestamp: '2024-03-19T15:45:00Z',
    },
  },
];

const { width } = Dimensions.get('window');
const AVATAR_SIZE = 48;
const MESSAGE_PREVIEW_LENGTH = 40;

function getAvatarColor(username: string) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 60%, 70%)`;
}

function truncateMessage(message: string, maxLength: number) {
  if (message.length <= maxLength) return message;
  return message.slice(0, maxLength) + '...';
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

export function MessagesScreen() {
  const { user } = useUser();

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const otherParticipant = item.participants.find(p => p.id !== user.username);
    if (!otherParticipant) return null;

    return (
      <TouchableOpacity style={styles.conversationItem}>
        <View style={styles.avatarContainer}>
          {otherParticipant.profileImage ? (
            <Image
              source={otherParticipant.profileImage}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: getAvatarColor(otherParticipant.username) }]}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.username}>{otherParticipant.username}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.lastMessage.timestamp)}</Text>
          </View>
          <Text style={styles.messagePreview} numberOfLines={1}>
            {truncateMessage(item.lastMessage.content, MESSAGE_PREVIEW_LENGTH)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      {mockConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Messages</Text>
        </View>
      ) : (
        <FlatList
          data={mockConversations}
          renderItem={renderConversationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f6f7fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  listContent: {
    paddingTop: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  messagePreview: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
}); 