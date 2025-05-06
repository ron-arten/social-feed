import React, { useState } from 'react';
import { Modal, View, TextInput, Button, Image, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { text: string; imageUri?: string }) => void;
}

export function CreatePostModal({ visible, onClose, onSubmit }: CreatePostModalProps) {
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [isPicking, setIsPicking] = useState(false);

  async function handlePickImage() {
    setIsPicking(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    setIsPicking(false);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  }

  function handleSubmit() {
    onSubmit({ text, imageUri });
    setText('');
    setImageUri(undefined);
    onClose();
  }

  function handleClose() {
    setText('');
    setImageUri(undefined);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <TextInput
              style={styles.input}
              placeholder="What's on your mind?"
              value={text}
              onChangeText={setText}
              multiline
              accessibilityLabel="Post text input"
            />
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" accessibilityLabel="Selected image" />
            )}
            <Button title={imageUri ? 'Change Image' : 'Add Image'} onPress={handlePickImage} disabled={isPicking} />
            <View style={styles.actions}>
              <Button title="Cancel" onPress={handleClose} color="#888" />
              <Button title="Post" onPress={handleSubmit} disabled={!text.trim() && !imageUri} />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: '33%',
  },
  input: {
    minHeight: 60,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
}); 