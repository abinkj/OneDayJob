import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import { Colors } from '../../constants/Colors';

const JobDescriptionSection = ({
  jobDescription,
  setJobDescription,
  requirements,
  photos,
  toggleRequirementsList,
  showRequirementsList,
  openEditRequirements,
  togglePhotosList,
  showPhotosList,
  handlePickImage
}) => {
  return (
    <View style={styles.unifiedContainer}>
      {/* Job Description Input */}
      <TextInput
        style={styles.textArea}
        value={jobDescription}
        onChangeText={setJobDescription}
        placeholder="Add a detailed description about the job you wanted to done"
        placeholderTextColor={Colors.grey}
        multiline
        numberOfLines={4}
      />
      
      {/* Separator */}
      <View style={styles.separator} />
      
      {/* Requirements Section */}
      <TouchableOpacity style={styles.optionRow} onPress={toggleRequirementsList}>
        <View style={styles.optionLeftSection}>
          <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.optionText}>Add Requirements</Text>
        </View>
        <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
      </TouchableOpacity>
      
      {showRequirementsList && (
        <View style={styles.expandedInnerSection}>
          {requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <Ionicons name="document-outline" size={20} color={Colors.primary} />
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.editButton} onPress={openEditRequirements}>
            <Ionicons name="pencil" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Separator */}
      <View style={styles.separator} />
      
      {/* Photos Section */}
      <TouchableOpacity style={styles.optionRow} onPress={togglePhotosList}>
        <View style={styles.optionLeftSection}>
          <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.optionText}>Add Photos</Text>
        </View>
        <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
      </TouchableOpacity>
      
      {showPhotosList && (
        <View style={styles.expandedInnerSection}>
          <FlatList
            horizontal
            data={photos}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.photoContainer}>
                <Image source={{ uri: item }} style={styles.photoThumbnail} />
              </View>
            )}
            contentContainerStyle={{ paddingLeft: 8 }}
          />
          <TouchableOpacity style={styles.editButton} onPress={handlePickImage}>
            <Ionicons name="pencil" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};


export default JobDescriptionSection;