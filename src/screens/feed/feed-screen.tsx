import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, Platform, ListRenderItem, TextInput, Keyboard, ImageSourcePropType, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreatePostModal } from '../../components/create-post-modal';
import * as FileSystem from 'expo-file-system';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../../contexts/user-context';
import { SearchBar } from '../../components/search-bar';

dayjs.extend(relativeTime);

interface Comment {
  text: string;
  username: string;
  timestamp: string;
  profileImage?: ImageSourcePropType;
}

interface Post {
  id: string;
  author: string;
  authorProfileImage?: ImageSourcePropType;
  content: string;
  image?: string;
  createdAt: string;
  editedAt?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  commentList?: Comment[];
}

const POSTS_FILE = FileSystem.documentDirectory + 'posts.json';

const initialPosts: Post[] = [
  { 
    id: '1', 
    author: 'ee_person',
    authorProfileImage: require('../../images/profileImage/christian-buehner-DItYlc26zVI-unsplash.jpg'),
    content: 'Stakeholder meeting with the team', 
    image: undefined, 
    createdAt: dayjs().subtract(2, 'hour').toISOString(), 
    likes: 356, 
    comments: 6, 
    shares: 40 
  },
  { 
    id: '2', 
    author: 'Isabella Lee', 
    content: 'Gathered together in this photo are some of the most amazing women!', 
    image: undefined, 
    createdAt: dayjs().subtract(1, 'hour').toISOString(), 
    likes: 120, 
    comments: 3, 
    shares: 12 
  },
];

function getAvatarColor(name: string) {
  // Simple hash for color
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
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [commentSheetPostId, setCommentSheetPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const commentInputRef = useRef<TextInput>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['50%'], []);
  const insets = useSafeAreaInsets();
  const [isContextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const file = await FileSystem.readAsStringAsync(POSTS_FILE);
      const savedPosts: Post[] = JSON.parse(file);
      setPosts(savedPosts);
    } catch (e) {
      setPosts(initialPosts);
    } finally {
      setIsLoading(false);
    }
  }

  async function savePosts(newPosts: Post[]) {
    try {
      await FileSystem.writeAsStringAsync(POSTS_FILE, JSON.stringify(newPosts));
    } catch (e) {
      Alert.alert('Error', 'Failed to save posts.');
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
    const newPost: Post = {
      id: Date.now().toString(),
      author: user.username,
      authorProfileImage: user.profileImage,
      content: text.trim(),
      image: imageUri,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      shares: 0,
    };
    const newPosts = [newPost, ...posts];
    setPosts(newPosts);
    await savePosts(newPosts);
  }

  function handleToggleLike(postId: string) {
    setLikedPosts(prev => {
      const isLiked = prev[postId];
      const updated = { ...prev, [postId]: !isLiked };
      setPosts(posts => posts.map(post =>
        post.id === postId
          ? { ...post, likes: (post.likes ?? 0) + (!isLiked ? 1 : -1) }
          : post
      ));
      savePosts(posts.map(post =>
        post.id === postId
          ? { ...post, likes: (post.likes ?? 0) + (!isLiked ? 1 : -1) }
          : post
      ));
      return updated;
    });
  }

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setCommentSheetPostId(null);
      setCommentInput('');
    }
  }, []);

  function handleSaveComment() {
    if (!commentSheetPostId || !commentInput.trim()) return;
    const newComment: Comment = {
      text: commentInput.trim().slice(0, 100),
      username: user.username,
      timestamp: new Date().toISOString(),
      profileImage: user.profileImage,
    };
    setPosts(posts => posts.map(post =>
      post.id === commentSheetPostId
        ? {
            ...post,
            commentList: [newComment, ...(post.commentList || [])],
            comments: (post.comments ?? 0) + 1,
          }
        : post
    ));
    setCommentInput('');
    if (commentInputRef.current) {
      commentInputRef.current.clear();
    }
    Keyboard.dismiss();
  }

  function handleOpenCommentSheet(postId: string) {
    setCommentSheetPostId(postId);
    setCommentInput('');
    if (commentInputRef.current) {
      commentInputRef.current.clear();
    }
    bottomSheetModalRef.current?.present();
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

  function handleDeletePost() {
    if (!selectedPostId) return;
    setPosts(posts => posts.filter(post => post.id !== selectedPostId));
    handleCloseContextMenu();
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

  function handleSaveEdit() {
    if (!editingPostId) return;
    setPosts(posts => posts.map(post =>
      post.id === editingPostId
        ? {
            ...post,
            content: editingContent,
            editedAt: new Date().toISOString(),
          }
        : post
    ));
    setEditingPostId(null);
    setEditingContent('');
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
          >
            {user.profileImage ? (
              <Image 
                source={user.profileImage} 
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
        <TouchableOpacity onPress={handleCreatePost} style={styles.createPostButton}>
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
            source={item.authorProfileImage} 
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
            >
              <Text style={styles.editButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.editButton, styles.saveButton]} 
              onPress={handleSaveEdit}
            >
              <Text style={[styles.editButtonText, { color: '#fff' }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.content}>{item.content}</Text>
      )}
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" accessibilityLabel="Post image" />
      )}
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionGroup, styles.heartActionGroup]} onPress={() => handleToggleLike(item.id)} accessibilityLabel="Like post">
          <Ionicons
            name={likedPosts[item.id] ? 'heart-dislike-outline' : 'heart-outline'}
            size={18}
            color="#e74c3c"
            style={styles.heartIcon}
          />
          <Text style={styles.actionText}>{item.likes ?? 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionGroup} onPress={() => handleOpenCommentSheet(item.id)} accessibilityLabel="Comment on post">
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#888" />
          <Text style={styles.actionText}>{item.commentList?.length ?? 0}</Text>
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7fb' }}>
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
          contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 0 }}
          showsVerticalScrollIndicator={false}
        />
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose
          onDismiss={handleCloseCommentSheet}
          backgroundStyle={{ backgroundColor: '#fff' }}
          handleIndicatorStyle={{ backgroundColor: '#888' }}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView style={styles.commentSheetContent}>
            <Text style={styles.commentSheetTitle}>Comments</Text>
            <FlatList
              data={posts.find(post => post.id === commentSheetPostId)?.commentList || []}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  {item.profileImage ? (
                    <Image 
                      source={item.profileImage} 
                      style={styles.commentAvatar} 
                      resizeMode="cover"
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
            />
            <View style={styles.commentInputRow}>
              <TextInput
                ref={commentInputRef}
                style={styles.commentInput}
                placeholder="Write a comment..."
                defaultValue=""
                onChangeText={text => {
                  if (text.length <= 100) {
                    setCommentInput(text);
                  }
                }}
                maxLength={100}
                multiline
                accessibilityLabel="Comment input"
              />
              <TouchableOpacity onPress={handleSaveComment} style={styles.sendButton} accessibilityLabel="Send comment">
                <Ionicons name="arrow-up-circle" size={28} color="#6c63ff" />
              </TouchableOpacity>
            </View>
          </BottomSheetView>
        </BottomSheetModal>
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
              >
                <Ionicons name="pencil-outline" size={20} color="#6c63ff" />
                <Text style={[styles.contextMenuText, { color: '#6c63ff' }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.contextMenuItem}
                onPress={handleDeletePost}
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
    marginBottom: 16,
    color: '#222',
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
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
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