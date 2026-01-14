import React, { useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "./styles";
import { useTheme } from "../../contexts/ThemeContext";

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
  handlePickImage,
}: {
  jobDescription: string;
  setJobDescription: (text: string) => void;
  requirements: string[];
  photos?: string[];
  toggleRequirementsList: () => void;
  showRequirementsList: boolean;
  openEditRequirements: () => void;
  togglePhotosList?: () => void;
  showPhotosList?: boolean;
  handlePickImage?: () => void;
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.unifiedContainer}>
      {/* Job Description Input */}
      <TextInput
        style={styles.textArea}
        value={jobDescription}
        onChangeText={setJobDescription}
        placeholder="Add a detailed description about the job you wanted to done"
        placeholderTextColor={colors.grey}
        multiline
        numberOfLines={4}
        maxLength={150}
      />

      {/* Separator */}
      <View style={styles.separator} />

      {/* Requirements Section */}
      <TouchableOpacity
        style={styles.optionRow}
        onPress={toggleRequirementsList}
      >
        <View style={styles.optionLeftSection}>
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.optionText}>Add Requirements</Text>
        </View>
        <Ionicons
          name="information-circle-outline"
          size={24}
          color={colors.primary}
        />
      </TouchableOpacity>

      {showRequirementsList && (
        <View style={styles.expandedInnerSection}>
          {requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <Ionicons
                name="document-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.editButton}
            onPress={openEditRequirements}
          >
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Separator */}
      <View style={styles.separator} />
    </View>
  );
};

export default JobDescriptionSection;
