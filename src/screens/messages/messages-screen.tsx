import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../contexts/user-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { dbOperations } from '../../services/database';
import { getLocalImageSource } from '../../utils/image-require';

type RootStackParamList = {
  Main: undefined;
  Profile: undefined;
  Chat: {
    otherUserId: string;
    otherUsername: string;
    otherProfileImage?: string;
  };
  AccountDetails: undefined;
  Notifications: undefined;
  BlockedUsers: undefined;
  Privacy: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  other_username: string;
  other_profile_image?: string;
}

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
  const navigation = useNavigation<NavigationProp>();
  const [conversations, setConversations] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      const data = await dbOperations.getConversations(user.id) as Message[];
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleConversationPress = (conversation: Message) => {
    const otherUserId = conversation.sender_id === user.id ? conversation.receiver_id : conversation.sender_id;
    navigation.navigate('Chat', {
      otherUserId,
      otherUsername: conversation.other_username,
      otherProfileImage: conversation.other_profile_image,
    });
  };

  const renderConversationItem = ({ item }: { item: Message }) => {
    return (
      <TouchableOpacity 
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
        activeOpacity={0.7}
        testID="conversation-item"
      >
        <View style={styles.avatarContainer}>
          {item.other_profile_image ? (
            <Image
              source={getLocalImageSource(item.other_profile_image) || { uri: item.other_profile_image }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.other_username) }]}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.username}>{item.other_username}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.created_at)}</Text>
          </View>
          <Text style={styles.messagePreview} numberOfLines={1}>
            {truncateMessage(item.content, MESSAGE_PREVIEW_LENGTH)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Messages</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
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