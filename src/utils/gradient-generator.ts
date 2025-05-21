import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

interface GradientColors {
  start: string;
  end: string;
}

const generateGradientColors = (seed: number): GradientColors => {
  // Use the seed to generate consistent colors
  const hue1 = (seed * 137.5) % 360;
  const hue2 = (hue1 + 120) % 360;
  
  return {
    start: `hsl(${hue1}, 70%, 60%)`,
    end: `hsl(${hue2}, 70%, 60%)`,
  };
};

export async function generateGradientImage(postId: string): Promise<string> {
  const colors = generateGradientColors(parseInt(postId));
  const viewShotRef = React.useRef<ViewShot>(null);
  
  // Create the gradient view
  const gradientView = React.createElement(
    ViewShot,
    { ref: viewShotRef, style: { width: 256, height: 256 } },
    React.createElement(
      LinearGradient,
      {
        colors: [colors.start, colors.end],
        style: { width: '100%', height: '100%' },
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 }
      }
    )
  );

  try {
    // Capture the view
    const uri = await viewShotRef.current?.capture();
    if (!uri) throw new Error('Failed to capture gradient view');

    // Resize and compress the image
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 256, height: 256 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Save to local storage
    const fileName = `gradient_${postId}.jpg`;
    const filePath = `${FileSystem.documentDirectory}images/posts/${fileName}`;
    
    // Ensure directory exists
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.documentDirectory}images/posts`,
      { intermediates: true }
    );

    // Move the file to the final location
    await FileSystem.moveAsync({
      from: manipResult.uri,
      to: filePath
    });

    return filePath;
  } catch (error) {
    console.error('Error generating gradient image:', error);
    throw error;
  }
} 