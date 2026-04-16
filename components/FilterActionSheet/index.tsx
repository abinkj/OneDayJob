import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { useTheme } from '../../contexts/ThemeContext';

export interface FilterActionSheetRef {
  show: () => void;
  hide: () => void;
}

interface FilterOption {
  id: string | number;
  _id?: string | number;
  name: string;
}

interface FilterActionSheetProps {
  title: string;
  options: FilterOption[];
  selectedValue: any;
  onSelect: (value: any) => void;
}

const FilterActionSheet = forwardRef<FilterActionSheetRef, FilterActionSheetProps>(
  ({ title, options, selectedValue, onSelect }, ref) => {
    const actionSheetRef = useRef<ActionSheetRef>(null);
    const { colors } = useTheme();

    useImperativeHandle(ref, () => ({
      show: () => actionSheetRef.current?.show(),
      hide: () => actionSheetRef.current?.hide(),
    }));

    const renderOption = ({ item }: { item: FilterOption }) => {
      const itemId = item.id || item._id;
      const isSelected = selectedValue === itemId;

      return (
        <TouchableOpacity
          style={[
            styles.item,
            { backgroundColor: isSelected ? colors.primary + '10' : 'transparent' },
          ]}
          onPress={() => {
            onSelect(itemId);
            actionSheetRef.current?.hide();
          }}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.itemText,
              {
                color: isSelected ? colors.primary : colors.black,
                fontWeight: isSelected ? '600' : '400',
              },
            ]}
          >
            {item.name}
          </Text>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
          )}
        </TouchableOpacity>
      );
    };

    return (
      <ActionSheet
        ref={actionSheetRef}
        containerStyle={{
          backgroundColor: colors.white,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingBottom: 20,
        }}
        indicatorStyle={{
          width: 40,
          backgroundColor: colors.border,
          marginTop: 10,
        }}
        gestureEnabled={true}
        defaultOverlayOpacity={0.7}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.black }]}>{title}</Text>
            <TouchableOpacity
              onPress={() => actionSheetRef.current?.hide()}
              style={styles.closeButton}
            >
              <Ionicons name="close-circle" size={28} color={colors.grey} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => String(item.id || item._id)}
            renderItem={renderOption}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            bounces={false}
          />
        </View>
      </ActionSheet>
    );
  }
);

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  list: {
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
  },
});

FilterActionSheet.displayName = 'FilterActionSheet';

export default FilterActionSheet;
