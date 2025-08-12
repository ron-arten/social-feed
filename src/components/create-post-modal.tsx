import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Image, 
  StyleSheet, 
  Keyboard,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import {WithPendoModal} from 'rn-pendo-sdk';    

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { text: string; imageUri?: string }) => void;
}

const KEYBOARD_GAP = 18;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function CreatePostModal({ visible, onClose, onSubmit }: CreatePostModalProps) {
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [isPicking, setIsPicking] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const PendoBottomSheetModal = WithPendoModal(BottomSheetModal);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  
  // Dynamic snap points based on image presence
  const snapPoints = useMemo(() => {
    if (imageUri) {
      return ['90%']; // Reduced from 100% to 90% when image is present
    }
    return ['65%']; // Reduced from 75% to 65% when no image
  }, [imageUri]);

  // Keyboard listeners
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

  // Callbacks
  const handlePresentModal = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleDismissModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

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

  // Show/hide modal based on visible prop
  useEffect(() => {
    if (visible) {
      handlePresentModal();
    } else {
      handleDismissModal();
    }
  }, [visible, handlePresentModal, handleDismissModal]);

  // Update snap points when image changes
  useEffect(() => {
    if (imageUri) {
      bottomSheetModalRef.current?.expand();
    } else {
      bottomSheetModalRef.current?.snapToIndex(0);
    }
  }, [imageUri]);

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
    handleDismissModal();
  }

  function handleClose() {
    setText('');
    setImageUri(undefined);
    handleDismissModal();
  }
// Original BottomSheetModal here
  return (
    <PendoBottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      onChange={handleSheetChanges}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      backdropComponent={renderBackdrop}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetScrollView 
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight + KEYBOARD_GAP : KEYBOARD_GAP }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* <View style={styles.header}>
          <Text style={styles.title}>Create Post</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#888" />
          </TouchableOpacity>
        </View> */}
        
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          value={text}
          onChangeText={setText}
          multiline
          accessibilityLabel="Post text input"
          autoFocus
        />
        
        {imageUri && (
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image} 
            resizeMode="cover" 
            accessibilityLabel="Selected image" 
          />
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.imageButton}
            onPress={handlePickImage} 
            disabled={isPicking}
            testID="image-picker-button"
          >
            <Ionicons 
              name={imageUri ? "image" : "image-outline"} 
              size={24} 
              color="#6c63ff" 
            />
            <Text style={styles.imageButtonText}>
              {imageUri ? 'Change Image' : 'Add Image'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]} 
            onPress={handleClose}
            testID="cancel-post-button"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.postButton,
              (!text.trim() && !imageUri) && styles.postButtonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={!text.trim() && !imageUri}
            testID="submit-post-button"
          >
            <Text style={[
              styles.postButtonText,
              (!text.trim() && !imageUri) && styles.postButtonTextDisabled
            ]}>
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </PendoBottomSheetModal> 
    // Original BottomSheetModal here
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: '#888',
    width: 40,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    minHeight: SCREEN_HEIGHT * 0.65, // Reduced from 0.75 to 0.65 to match snap point
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  input: {
    minHeight: 60,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    maxHeight: 200,
  },
  image: {
    width: '100%',
    height: 180, // Increased height for better visibility
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonContainer: {
    marginBottom: 12,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  imageButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6c63ff',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#eee',
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  postButton: {
    backgroundColor: '#6c63ff',
  },
  postButtonDisabled: {
    backgroundColor: '#e9e9e9',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    color: '#999',
  },
}); 