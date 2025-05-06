import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../contexts/user-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

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

  const handleSaveUsername = () => {
    if (newUsername.trim() && newUsername !== user.username) {
      updateUser({ username: newUsername.trim() });
    }
    setIsEditingUsername(false);
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
      <View style={styles.content}>
        <Image
          source={user.profileImage}
          style={styles.profileImage}
          resizeMode="cover"
        />
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
        <Text style={styles.biography}>{user.biography}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
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
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    marginBottom: 16,
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
    paddingHorizontal: 32,
    lineHeight: 24,
  },
}); 