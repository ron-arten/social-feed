import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Profile: undefined;
  Debug: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type DebugOption = {
  id: string;
  label: string;
};

const debugOptions: DebugOption[] = [
  { id: 'manual-track-events', label: 'Manual Track Events' },
  { id: 'enable-deep-links', label: 'Enable Deep Links' },
  { id: 'manual-language', label: 'Manual User/App Language' },
  { id: 'manual-guides', label: 'Manual Pause/Start Guides' },
  { id: 'manual-page-scanning', label: 'Manual Page Scanning' },
  { id: 'dynamic-content', label: 'Dynamic Content' },
  { id: 'change-identity', label: 'Change Identity' },
];

export function DebugScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, boolean>>({});

  const toggleOption = React.useCallback((optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  }, []);

  const hasSelection = React.useMemo(
    () => Object.values(selectedOptions).some(Boolean),
    [selectedOptions]
  );

  const handleApply = React.useCallback(() => {
    if (!hasSelection) {
      return;
    }

    // Placeholder for future apply logic
    console.log('Applying debug options:', selectedOptions);
  }, [hasSelection, selectedOptions]);

  const renderItem = ({ item }: { item: DebugOption }) => {
    const isSelected = !!selectedOptions[item.id];

    return (
      <TouchableOpacity
        style={styles.option}
        onPress={() => toggleOption(item.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={item.label}
        testID={`${item.id}-option`}
      >
        <View style={styles.optionContent}>
          <Ionicons
            name={isSelected ? 'checkbox-outline' : 'square-outline'}
            size={24}
            color={isSelected ? '#6c63ff' : '#bbb'}
          />
          <Text style={styles.optionLabel}>{item.label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back to profile"
          testID="back-button"
        >
          <Ionicons name="arrow-back" size={24} color="#6c63ff" />
        </TouchableOpacity>
        <Text style={styles.title}>Debug</Text>
        <TouchableOpacity
          style={[styles.applyButton, !hasSelection && styles.applyButtonDisabled]}
          onPress={handleApply}
          disabled={!hasSelection}
          accessibilityRole="button"
          accessibilityState={{ disabled: !hasSelection }}
          accessibilityLabel="Apply selected debug options"
          testID="apply-button"
        >
          <Text style={[styles.applyButtonText, !hasSelection && styles.applyButtonTextDisabled]}>
            Apply
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.listWrapper}>
        <FlatList
          data={debugOptions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
  },
  applyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#6c63ff',
  },
  applyButtonDisabled: {
    backgroundColor: '#d3d3d3',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  applyButtonTextDisabled: {
    color: '#888',
  },
  listWrapper: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  listContent: {
    paddingVertical: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: '#222',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 20,
  },
});
