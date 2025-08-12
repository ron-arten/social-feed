import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, Platform, ListRenderItem, TextInput, Keyboard, ImageSourcePropType, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreatePostModal } from '../../components/create-post-modal';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser, userEventEmitter, USER_UPDATED_EVENT } from '../../contexts/user-context';
import { useDatabase } from '../../contexts/database-context';
import { dbOperations } from '../../services/database';
import { SearchBar } from '../../components/search-bar';
import { getLocalImageSource } from '../../utils/image-require';
import {WithPendoModal} from 'rn-pendo-sdk';    

dayjs.extend(relativeTime);

const PendoBottomSheetModal = WithPendoModal(BottomSheetModal);

interface Comment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  profileImage?: ImageSourcePropType;
}

interface DatabaseComment {
  id: string;
  content: string;
  username: string;
  created_at: string;
  profile_image?: string;
}

interface Post {
  id: string;
  author: string;
  authorProfileImage?: string;
  content: string;
  image?: string;
  createdAt: string;
  editedAt?: string;
  likes: number;
  comments: number;
  shares: number;
  commentList?: Comment[];
}

interface DatabasePost {
  id: string;
  author: string;
  author_profile_image?: string;
  content: string;
  image_uri?: string;
  created_at: string;
  edited_at?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
}

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const color = `hsl(${hash % 360}, 60%, 70%)`;
  return color;
}

interface TextInputRef extends TextInput {
  value?: string;
}

type RootStackParamList = {
  Main: undefined;
  Profile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function FeedScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useUser();
  const { isInitialized, error } = useDatabase();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [commentSheetPostId, setCommentSheetPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const commentInputRef = useRef<TextInput>(null);
  const bottomSheetModalRef = useRef<any>(null);
  const snapPoints = useMemo(() => ['75%'], []);
  const insets = useSafeAreaInsets();
  const [isContextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});


  useEffect(() => {
    if (isInitialized) {
      loadPosts();
    }
  }, [isInitialized]);

  useEffect(() => {
    const unsubscribe = userEventEmitter.addListener(() => {
      loadPosts();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  async function loadPosts() {
    try {
      const dbPosts = await dbOperations.getPosts() as DatabasePost[];
      const formattedPosts: Post[] = dbPosts.map(post => ({
        id: post.id,
        author: post.author,
        authorProfileImage: post.author_profile_image ? post.author_profile_image : undefined,
        content: post.content,
        image: post.image_uri,
        createdAt: post.created_at,
        editedAt: post.edited_at,
        likes: post.likes_count,
        comments: post.comments_count,
        shares: post.shares_count,
      }));
      setPosts(formattedPosts);
      
      // Load liked status for each post
      const likedStatus: Record<string, boolean> = {};
      for (const post of dbPosts) {
        likedStatus[post.id] = await dbOperations.isPostLiked(post.id, user.id);
      }
      setLikedPosts(likedStatus);
    } catch (e) {
      Alert.alert('Error', 'Failed to load posts.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleCreatePost() {
    setModalVisible(true);
  }

  async function handleSubmitPost({ text, imageUri }: { text: string; imageUri?: string }) {
    if (!text.trim() && !imageUri) {
      Alert.alert('Validation', 'Please enter text or select an image.');
      return;
    }

    try {
      // First, ensure the user exists in the database
      const existingUser = await dbOperations.getUser(user.id);
      if (!existingUser) {
        await dbOperations.createUser({
          id: user.id,
          username: user.username,
          profileImage: typeof user.profileImage === 'string' ? user.profileImage : undefined,
        });
      }

      const postId = Date.now().toString();
      await dbOperations.createPost({
        id: postId,
        authorId: user.id,
        content: text.trim(),
        imageUri,
      });

      // Reload posts to get the latest data
      await loadPosts();
    } catch (e) {
      console.error('Error creating post:', e);
      Alert.alert(
        'Error',
        'Failed to create post. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }

  async function handleToggleLike(postId: string) {
    try {
      const isLiked = await dbOperations.toggleLike(postId, user.id);
      setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
      await loadPosts(); // Reload to get updated counts
    } catch (e) {
      Alert.alert('Error', 'Failed to update like status.');
    }
  }

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setCommentSheetPostId(null);
      setCommentInput('');
    }
  }, []);

  async function loadComments(postId: string) {
    try {
      const dbComments = await dbOperations.getComments(postId) as DatabaseComment[];
      const formattedComments: Comment[] = dbComments.map(comment => ({
        id: comment.id,
        text: comment.content,
        username: comment.username,
        timestamp: comment.created_at,
        profileImage: comment.profile_image ? getLocalImageSource(comment.profile_image) || { uri: comment.profile_image } : undefined,
      }));
      setComments(prev => ({ ...prev, [postId]: formattedComments }));
    } catch (e) {
      console.error('Error loading comments:', e);
      Alert.alert('Error', 'Failed to load comments.');
    }
  }

  async function handleOpenCommentSheet(postId: string) {
    setCommentSheetPostId(postId);
    setCommentInput('');
    if (commentInputRef.current) {
      commentInputRef.current.clear();
    }
    await loadComments(postId); // Load comments when opening the sheet
    bottomSheetModalRef.current?.present();
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  }

  async function handleSaveComment() {
    if (!commentSheetPostId || !commentInput.trim()) return;

    try {
      const commentId = Date.now().toString();
      await dbOperations.createComment({
        id: commentId,
        postId: commentSheetPostId,
        authorId: user.id,
        content: commentInput.trim().slice(0, 100),
      });

      setCommentInput('');
      if (commentInputRef.current) {
        commentInputRef.current.clear();
      }
      Keyboard.dismiss();
      await loadPosts(); // Reload to get updated comment count
      await loadComments(commentSheetPostId); // Reload comments to show the new one
    } catch (e) {
      Alert.alert('Error', 'Failed to save comment.');
    }
  }

  function handleCloseCommentSheet() {
    setCommentSheetPostId(null);
    setCommentInput('');
    if (commentInputRef.current) {
      commentInputRef.current.clear();
    }
    bottomSheetModalRef.current?.dismiss();
  }

  function handleOpenContextMenu(postId: string) {
    setSelectedPostId(postId);
    setContextMenuVisible(true);
  }

  function handleCloseContextMenu() {
    setContextMenuVisible(false);
    setSelectedPostId(null);
  }

  async function handleDeletePost() {
    if (!selectedPostId) return;

    try {
      await dbOperations.deletePost(selectedPostId);
      handleCloseContextMenu();
      await loadPosts(); // Reload to reflect deletion
    } catch (e) {
      Alert.alert('Error', 'Failed to delete post.');
    }
  }

  function handleEditPost() {
    if (!selectedPostId) return;
    const post = posts.find(p => p.id === selectedPostId);
    if (post) {
      setEditingPostId(selectedPostId);
      setEditingContent(post.content);
    }
    handleCloseContextMenu();
  }

  async function handleSaveEdit() {
    if (!editingPostId) return;

    try {
      await dbOperations.updatePost(editingPostId, editingContent);
      setEditingPostId(null);
      setEditingContent('');
      await loadPosts(); // Reload to get updated content
    } catch (e) {
      Alert.alert('Error', 'Failed to update post.');
    }
  }

  function handleCancelEdit() {
    setEditingPostId(null);
    setEditingContent('');
  }

  function renderHeader() {
    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            style={styles.profileButton}
            accessibilityLabel="Go to profile"
            testID="profile-button"
          >
            {user.profileImage ? (
              <Image 
                source={getLocalImageSource(user.profileImage) || { uri: user.profileImage }} 
                style={styles.profileAvatar} 
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.profileAvatar, { backgroundColor: getAvatarColor(user.username) }]}>
                <Ionicons name="person" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <SearchBar />
        </View>
        <TouchableOpacity 
          onPress={handleCreatePost} 
          style={styles.createPostButton}
          testID="create-post-button"
        >
          <Ionicons name="add-circle-outline" size={24} color="#6c63ff" />
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem: ListRenderItem<Post> = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {item.authorProfileImage ? (
          <Image 
            source={getLocalImageSource(item.authorProfileImage) || { uri: item.authorProfileImage }} 
            style={styles.avatar} 
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.author) }]}> 
            <Ionicons name="person" size={22} color="#fff" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.author}>{item.author}</Text>
          <View style={styles.timestampRow}>
            <Text style={styles.timestamp}>{dayjs(item.createdAt).fromNow()}</Text>
            {item.editedAt && (
              <Text style={styles.editedText}>edited</Text>
            )}
          </View>
        </View>
        <TouchableOpacity 
          style={styles.menuButton} 
          accessibilityLabel="More options"
          onPress={() => handleOpenContextMenu(item.id)}
          testID="post-menu-button"
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
        </TouchableOpacity>
      </View>
      {editingPostId === item.id ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editingContent}
            onChangeText={setEditingContent}
            multiline
            maxLength={500}
          />
          <View style={styles.editActions}>
            <TouchableOpacity 
              style={[styles.editButton, styles.cancelButton]} 
              onPress={handleCancelEdit}
              testID="cancel-edit-button"
            >
              <Text style={styles.editButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.editButton, styles.saveButton]} 
              onPress={handleSaveEdit}
              testID="save-edit-button"
            >
              <Text style={[styles.editButtonText, { color: '#fff' }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.content}>{item.content}</Text>
      )}
      {item.image && (
        <Image source={getLocalImageSource(item.image) || { uri: item.image }} style={styles.cardImage} resizeMode="cover" accessibilityLabel="Post image" />
      )}
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionGroup, styles.heartActionGroup]} 
          onPress={() => handleToggleLike(item.id)} 
          accessibilityRole="button"
          accessibilityLabel={`Like post. Currently ${item.likes ?? 0} likes`}
          accessibilityHint="Double tap to like or unlike this post"
          accessibilityState={{ 
            selected: likedPosts[item.id] || false 
          }}
          testID="like-button"
        >
          <Ionicons
            name={likedPosts[item.id] ? 'heart-dislike-outline' : 'heart-outline'}
            size={18}
            color="#e74c3c"
            style={styles.heartIcon}
          />
          <Text style={styles.actionText}>{item.likes ?? 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionGroup} 
          onPress={() => handleOpenCommentSheet(item.id)} 
          accessibilityRole="button"
          accessibilityLabel={`Comment on post. Currently ${item.comments} comments`}
          accessibilityHint="Double tap to view and add comments"
          testID="comment-button"
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#888" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <View style={styles.actionGroup}>
          <Ionicons name="arrow-redo-outline" size={18} color="#888" />
          <Text style={styles.actionText}>{item.shares ?? 0}</Text>
        </View>
      </View>
    </View>
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  if (isLoading) return <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f6f7fb' }}><Text>Loading...</Text></SafeAreaView>;

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7fb' }} edges={['top']}>
        <CreatePostModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleSubmitPost}
        />
        <FlatList
          data={posts}
          keyExtractor={(item: Post) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={
            <>
              {renderHeader()}
            </>
          }
          contentContainerStyle={{ 
            paddingBottom: Platform.select({
              ios: insets.bottom + 24,
              android: 24
            }),
            paddingHorizontal: 0 
          }}
          showsVerticalScrollIndicator={false}
        />
        <PendoBottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose
          onDismiss={handleCloseCommentSheet}
          onChange={handleSheetChanges}
          backgroundStyle={{ backgroundColor: '#fff' }}
          handleIndicatorStyle={{ backgroundColor: '#888' }}
          backdropComponent={renderBackdrop}
          keyboardBehavior="interactive"
          android_keyboardInputMode="adjustResize"
        >
          <BottomSheetView style={styles.commentSheetContent}>
            <Text style={styles.commentSheetTitle}>Comments</Text>
            <View style={styles.commentInputRow}>
              <TextInput
                ref={commentInputRef}
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={commentInput}
                onChangeText={text => {
                  if (text.length <= 100) {
                    setCommentInput(text);
                  }
                }}
                maxLength={100}
                multiline
                accessibilityLabel="Comment input"
              />
              <TouchableOpacity 
                onPress={handleSaveComment} 
                style={styles.sendButton} 
                accessibilityLabel="Send comment"
                testID="send-comment-button"
              >
                <Ionicons name="arrow-up-circle" size={28} color="#6c63ff" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={comments[commentSheetPostId || ''] || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  {item.profileImage ? (
                    <Image 
                      source={item.profileImage} 
                      style={styles.commentAvatar} 
                      resizeMode="cover"
                      accessibilityLabel={`${item.username}'s profile picture`}
                    />
                  ) : (
                    <View style={[styles.commentAvatar, { backgroundColor: getAvatarColor(item.username) }]}>
                      <Ionicons name="person" size={16} color="#fff" />
                    </View>
                  )}
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUsername}>{item.username}</Text>
                    <Text style={styles.commentText}>{item.text}</Text>
                    <Text style={styles.commentTime}>{dayjs(item.timestamp).fromNow()}</Text>
                  </View>
                </View>
              )}
              style={styles.commentList}
              contentContainerStyle={styles.commentListContent}
              keyboardShouldPersistTaps="handled"
            />
          </BottomSheetView>
        </PendoBottomSheetModal>
        <Modal
          visible={isContextMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={handleCloseContextMenu}
        >
          <TouchableOpacity 
            style={styles.contextMenuOverlay}
            activeOpacity={1}
            onPress={handleCloseContextMenu}
          >
            <View style={styles.contextMenu}>
              <TouchableOpacity 
                style={styles.contextMenuItem}
                onPress={handleEditPost}
                testID="edit-post-button"
              >
                <Ionicons name="pencil-outline" size={20} color="#6c63ff" />
                <Text style={[styles.contextMenuText, { color: '#6c63ff' }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.contextMenuItem}
                onPress={handleDeletePost}
                testID="delete-post-button"
              >
                <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                <Text style={[styles.contextMenuText, { color: '#e74c3c' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileButton: {
    marginRight: 12,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  createPostButton: {
    padding: 8,
  },
  feedHeader: {
    backgroundColor: '#f6f7fb',
    paddingHorizontal: 20,
    paddingBottom: 4,
    borderBottomWidth: 0,
    zIndex: 2,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  feedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  feedHeaderRight: {
    display: 'none', // No longer needed
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
  },
  feedFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  filterText: {
    fontSize: 13,
    color: '#444',
    marginRight: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  author: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  timestamp: {
    color: '#888',
    fontSize: 12,
  },
  menuButton: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    fontSize: 15,
    marginBottom: 8,
    color: '#222',
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    color: '#888',
    marginLeft: 4,
    fontWeight: '500',
  },
  heartActionGroup: {
    minWidth: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    width: 24,
    textAlign: 'center',
  },
  commentSheetContent: {
    flex: 1,
    padding: 16,
  },
  commentSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 80,
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#f6f7fb',
  },
  commentList: {
    flex: 1,
  },
  commentListContent: {
    paddingBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: '#888',
  },
  sendButton: {
    marginLeft: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  contextMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  contextMenuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editedText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  editContainer: {
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#222',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#6c63ff',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});

export default FeedScreen; 