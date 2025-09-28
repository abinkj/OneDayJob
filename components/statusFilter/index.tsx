import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { StatusInfo } from '../../utilities/statusUtils';

interface StatusFilterProps {
  statuses: StatusInfo[];
  selectedStatus: string | null;
  onStatusSelect: (status: string | null) => void;
  showAll?: boolean;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  statuses,
  selectedStatus,
  onStatusSelect,
  showAll = true
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {showAll && (
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedStatus === null && styles.activeFilter
          ]}
          onPress={() => onStatusSelect(null)}
        >
          <Text style={[
            styles.filterText,
            selectedStatus === null && styles.activeFilterText
          ]}>
            All
          </Text>
        </TouchableOpacity>
      )}
      
      {statuses.map((status, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.filterButton,
            selectedStatus === status.label && styles.activeFilter
          ]}
          onPress={() => onStatusSelect(status.label)}
        >
          <Ionicons
            name={status.icon as any}
            size={14}
            color={selectedStatus === status.label ? Colors.white : status.color}
            style={styles.filterIcon}
          />
          <Text style={[
            styles.filterText,
            selectedStatus === status.label && styles.activeFilterText,
            { color: selectedStatus === status.label ? Colors.white : status.color }
          ]}>
            {status.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  contentContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.subGrey + '30',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.black,
  },
  activeFilterText: {
    color: Colors.white,
  },
});

export default StatusFilter;
