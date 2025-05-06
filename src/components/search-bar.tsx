import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function SearchBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const widthAnim = React.useRef(new Animated.Value(0)).current;
  const searchBarRef = useRef<View>(null);

  const toggleSearch = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.timing(widthAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    if (!searchText) {
      toggleSearch();
    }
  };

  const handleOutsidePress = () => {
    if (isExpanded && !searchText) {
      toggleSearch();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
        <Animated.View
          ref={searchBarRef}
          style={[
            styles.inputContainer,
            {
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [40, SCREEN_WIDTH - 120],
              }),
            },
          ]}
        >
          <TouchableOpacity onPress={toggleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#666" />
          </TouchableOpacity>
          <Animated.View
            style={{
              flex: 1,
              opacity: widthAnim,
            }}
          >
            <TextInput
              style={styles.input}
              placeholder="Search..."
              value={searchText}
              onChangeText={setSearchText}
              onBlur={handleBlur}
              autoCapitalize="none"
            />
          </Animated.View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  inputContainer: {
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    height: '100%',
    paddingLeft: 16,
    paddingRight: 16,
    fontSize: 16,
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 