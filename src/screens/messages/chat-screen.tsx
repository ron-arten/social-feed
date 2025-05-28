import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../contexts/user-context';
import { useDatabase } from '../../contexts/database-context';
import { dbOperations } from '../../services/database';
import { getLocalImageSource } from '../../utils/image-require';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  sender_username: string;
  sender_profile_image?: string;
  receiver_username: string;
  receiver_profile_image?: string;
}

type ChatScreenParams = {
  otherUserId: string;
  otherUsername: string;
  otherProfileImage?: string;
};

function generateUniqueId(): string {
  return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: ChatScreenParams }, 'params'>>();
  const { user } = useUser();
  const { isInitialized, error: dbError } = useDatabase();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const sendInProgressRef = useRef<boolean>(false);
  const sendTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const { otherUserId, otherUsername, otherProfileImage } = route.params;

  useEffect(() => {
    // Set status bar style
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(false);
    }

    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitle}>
          {otherProfileImage ? (
            <Image
              source={getLocalImageSource(otherProfileImage) || { uri: otherProfileImage }}
              style={styles.headerAvatar}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.headerAvatar, { backgroundColor: getAvatarColor(otherUsername) }]}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          )}
          <Text style={styles.headerUsername}>{otherUsername}</Text>
        </View>
      ),
      headerStyle: {
        backgroundColor: '#f6f7fb',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleContainerStyle: {
        paddingTop: 0,
      },
      headerShown: true,
      headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    });
    if (!isInitialized) {
      console.log('Database not initialized yet');
      return;
    }
    if (dbError) {
      console.error('Database error:', dbError);
      Alert.alert('Error', 'Database error. Please try again later.');
      return;
    }
    loadMessages();
  }, [isInitialized, dbError]);

  useEffect(() => {
    console.log('[Debug] Component state:', {
      isSending,
      sendInProgress: sendInProgressRef.current,
      messageCount: messages.length,
      isInitialized,
      hasDbError: !!dbError
    });
  }, [isSending, messages.length, isInitialized, dbError]);

  useEffect(() => {
    return () => {
      if (sendTimeoutRef.current) {
        clearTimeout(sendTimeoutRef.current);
      }
    };
  }, []);

  const updateUIWithMessage = (message: Message) => {
    console.log('[Message Send] Updating UI with message:', message.content);
    setMessages(prevMessages => {
      const newMessages = [...prevMessages, message];
      console.log('[Message Send] Messages array updated:', {
        previousLength: prevMessages.length,
        newLength: newMessages.length
      });
      return newMessages;
    });
    setNewMessage('');
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  };

  const persistMessageToDatabase = async (message: Message): Promise<boolean> => {
    try {
      console.log('[Message Send] Starting database operation...');
      await dbOperations.createMessage({
        id: message.id,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        content: message.content,
      });
      console.log('[Message Send] Database operation successful');
      return true;
    } catch (error) {
      console.error('[Message Send] Database operation failed:', error);
      return false;
    }
  };

  const resetSendingState = () => {
    console.log('[Message Send] Resetting sending state...');
    setIsSending(false);
    sendInProgressRef.current = false;
    if (sendTimeoutRef.current) {
      clearTimeout(sendTimeoutRef.current);
      sendTimeoutRef.current = null;
    }
    console.log('[Message Send] State reset complete');
  };

  async function loadMessages() {
    console.log('[Load Messages] Starting to load messages...');
    try {
      console.log('[Load Messages] Fetching messages for users:', {
        userId1: user.id,
        userId2: otherUserId
      });
      const data = await dbOperations.getMessages(user.id, otherUserId) as Message[];
      console.log('[Load Messages] Retrieved messages:', {
        count: data.length,
        firstMessage: data[0]?.content,
        lastMessage: data[data.length - 1]?.content
      });
      setMessages(data);
    } catch (error) {
      console.error('[Load Messages] Error loading messages:', error);
      if (error instanceof Error) {
        console.error('[Load Messages] Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
    } finally {
      setIsLoading(false);
      console.log('[Load Messages] Process completed');
    }
  }

  async function handleSendMessage() {
    console.log('[Message Send] 1. Starting send process');
    
    // Basic validation
    if (sendInProgressRef.current) {
      console.log('[Message Send] Aborted: Send already in progress');
      return;
    }

    if (!newMessage.trim()) {
      console.log('[Message Send] Aborted: Empty message');
      return;
    }

    console.log('[Message Send] 2. Validation passed');

    // Set sending state
    setIsSending(true);
    sendInProgressRef.current = true;
    console.log('[Message Send] 3. Set sending state');

    try {
      // Create message object with our custom ID generator
      const messageId = generateUniqueId();
      console.log('[Message Send] 4. Generated message ID:', messageId);
      
      const message: Message = {
        id: messageId,
        sender_id: user.id,
        receiver_id: otherUserId,
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
        sender_username: user.username,
        sender_profile_image: user.profileImage,
        receiver_username: otherUsername,
        receiver_profile_image: otherProfileImage,
      };
      console.log('[Message Send] 5. Created message object:', { id: message.id, content: message.content });

      // Update UI
      console.log('[Message Send] 6. About to update UI');
      const currentMessage = newMessage;
      setNewMessage(''); // Clear input first
      console.log('[Message Send] 7. Cleared input');
      
      setMessages(prevMessages => {
        console.log('[Message Send] 8. Updating messages array');
        const newMessages = [...prevMessages, message];
        console.log('[Message Send] 9. Messages array updated:', {
          previousLength: prevMessages.length,
          newLength: newMessages.length
        });
        return newMessages;
      });
      console.log('[Message Send] 10. Set messages state');

      // Scroll after a short delay to ensure state updates
      setTimeout(() => {
        console.log('[Message Send] 11. Attempting to scroll');
        flatListRef.current?.scrollToEnd({ animated: true });
        console.log('[Message Send] 12. Scroll completed');
      }, 100);

      console.log('[Message Send] 13. UI update complete');

      // Try database operation
      console.log('[Message Send] 14. Starting database operation');
      try {
        await dbOperations.createMessage({
          id: message.id,
          senderId: message.sender_id,
          receiverId: message.receiver_id,
          content: message.content,
        });
        console.log('[Message Send] 15. Database operation successful');
      } catch (dbError) {
        console.error('[Message Send] Database operation failed:', dbError);
        // Don't show error to user since message is in UI
      }

    } catch (error) {
      console.error('[Message Send] Unexpected error:', error);
      if (error instanceof Error) {
        console.error('[Message Send] Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
    } finally {
      console.log('[Message Send] 16. Resetting state');
      setIsSending(false);
      sendInProgressRef.current = false;
      console.log('[Message Send] 17. State reset complete');
    }
  }

  const handleSendPress = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    handleSendMessage();
  };

  function getAvatarColor(username: string) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 60%, 70%)`;
  }

  function formatMessageTime(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.sender_id === user.id;
    const showAvatar = index === 0 || messages[index - 1]?.sender_id !== item.sender_id;

    return (
      <Animated.View
        entering={FadeInDown.duration(300).delay(index * 50)}
        layout={Layout.springify()}
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
        ]}
      >
        {!isOwnMessage && showAvatar && (
          <View style={styles.avatarContainer}>
            {item.sender_profile_image ? (
              <Image
                source={getLocalImageSource(item.sender_profile_image) || { uri: item.sender_profile_image }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.sender_username) }]}>
                <Ionicons name="person" size={20} color="#00000" />
              </View>
            )}
          </View>
        )}
        <View style={[styles.messageBubble, isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble]}>
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.messageTime}>{formatMessageTime(item.created_at)}</Text>
        </View>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c63ff" />
        </View>
      </SafeAreaView>
    );  
  }

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <View style={styles.contentContainer}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              multiline
              maxLength={500}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[styles.sendButton, (!newMessage.trim() || isSending) && styles.sendButtonDisabled]}
              onPress={handleSendPress}
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  contentContainer: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
    gap: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
  },
  ownMessageBubble: {
    backgroundColor: 'rgba(49, 41, 210, 0.41)',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#00000',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(23, 22, 22, 0.7)',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
    ...(Platform.OS === 'android' && {
      paddingBottom: 8,
    }),
  },
  input: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 40,
    maxHeight: 100,
    fontSize: 15,
    color: '#222',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6c63ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
}); 