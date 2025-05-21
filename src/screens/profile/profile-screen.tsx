import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser, userEventEmitter, USER_UPDATED_EVENT } from '../../contexts/user-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ProfileSettingsMenu } from '../../components/profile-settings-menu';
import * as ImagePicker from 'expo-image-picker';
import { getLocalImageSource } from '../../utils/image-require';

type RootStackParamList = {
  Main: undefined;
  Profile: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');
const PROFILE_IMAGE_SIZE = width * 0.4;

export function ProfileScreen() {
  const { user, updateUser } = useUser();
  const navigation = useNavigation<NavigationProp>();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState(user.biography);
  const [isPickingImage, setIsPickingImage] = useState(false);

  useEffect(() => {
    setNewUsername(user.username);
    setNewBio(user.biography);
  }, [user]);

  useEffect(() => {
    const unsubscribe = userEventEmitter.addListener((updatedUser) => {
      setNewUsername(updatedUser.username);
      setNewBio(updatedUser.biography);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handlePickImage = async () => {
    try {
      setIsPickingImage(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImageUri = result.assets[0].uri;
        await updateUser({ profileImage: newImageUri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to update profile image. Please try again.');
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleSaveUsername = async () => {
    if (newUsername.trim() && newUsername !== user.username) {
      try {
        await updateUser({ username: newUsername.trim() });
        setIsEditingUsername(false);
      } catch (error) {
        console.error('Error updating username:', error);
        Alert.alert('Error', 'Failed to update username. Please try again.');
      }
    } else {
      setIsEditingUsername(false);
    }
  };

  const handleSaveBio = async () => {
    if (newBio !== user.biography) {
      try {
        await updateUser({ biography: newBio });
        setIsEditingBio(false);
      } catch (error) {
        console.error('Error updating biography:', error);
        Alert.alert('Error', 'Failed to update biography. Please try again.');
      }
    } else {
      setIsEditingBio(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Main')}
          accessibilityLabel="Back to feed"
        >
          <Ionicons name="home-outline" size={24} color="#6c63ff" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <TouchableOpacity 
            onPress={handlePickImage}
            disabled={isPickingImage}
            style={styles.profileImageContainer}
            accessibilityLabel="Change profile picture"
          >
            {user.profileImage ? (
              <Image
                source={getLocalImageSource(user.profileImage) || { uri: user.profileImage }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.profileImage, styles.placeholderImage]}>
                <Ionicons name="person" size={PROFILE_IMAGE_SIZE * 0.4} color="#fff" />
              </View>
            )}
            <View style={styles.editImageOverlay}>
              <Ionicons name="camera" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
          {isEditingUsername ? (
            <View style={styles.usernameEditContainer}>
              <TextInput
                style={styles.usernameInput}
                value={newUsername}
                onChangeText={setNewUsername}
                autoFocus
                maxLength={30}
                onSubmitEditing={handleSaveUsername}
                onBlur={handleSaveUsername}
              />
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveUsername}
                accessibilityLabel="Save username"
              >
                <Ionicons name="checkmark" size={24} color="#6c63ff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.usernameContainer}
              onPress={() => setIsEditingUsername(true)}
              accessibilityLabel="Edit username"
            >
              <Text style={styles.username}>{user.username}</Text>
              <Ionicons name="pencil" size={16} color="#666" style={styles.editIcon} />
            </TouchableOpacity>
          )}
          {isEditingBio ? (
            <View style={styles.bioEditContainer}>
              <TextInput
                style={styles.bioInput}
                value={newBio}
                onChangeText={setNewBio}
                multiline
                maxLength={200}
                autoFocus
                onSubmitEditing={handleSaveBio}
                onBlur={handleSaveBio}
              />
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveBio}
                accessibilityLabel="Save biography"
              >
                <Ionicons name="checkmark" size={24} color="#6c63ff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.bioContainer}
              onPress={() => setIsEditingBio(true)}
              accessibilityLabel="Edit biography"
            >
              <Text style={styles.biography}>{user.biography}</Text>
              <Ionicons name="pencil" size={16} color="#666" style={styles.editIcon} />
            </TouchableOpacity>
          )}
        </View>
        <ProfileSettingsMenu />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  content: {
    alignItems: 'center',
    paddingTop: 40,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
  },
  placeholderImage: {
    backgroundColor: '#6c63ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6c63ff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  editIcon: {
    marginLeft: 8,
  },
  usernameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  usernameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    borderBottomWidth: 1,
    borderBottomColor: '#6c63ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 100,
    textAlign: 'center',
  },
  saveButton: {
    marginLeft: 8,
    padding: 4,
  },
  biography: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 8,
    lineHeight: 24,
    marginBottom: 24,
  },
  bioContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  bioEditContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  bioInput: {
    fontSize: 16,
    color: '#444',
    borderWidth: 1,
    borderColor: '#6c63ff',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
}); 