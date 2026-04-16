import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../../../constants/Colors';
import { LocationData } from '../../../../services/locationService';
import CustomSwitch from '../../../../components/CustomSwich';
import JobDescriptionSection from '../../../../components/JobDescription';
import LocationSearch from '../../../../components/LocationSearch';

interface Category {
    id: string;
    name: string;
    icon: any;
}

interface JobDetailsFormProps {
    selectedValue: string;
    categoryIcon: any;


    // Job Name
    jobName: string;
    setJobName: (name: string) => void;

    // Job Description
    jobDescription: string;
    setJobDescription: (desc: string) => void;
    requirements: any[];
    photos: any[];
    toggleRequirementsList: () => void;
    showRequirementsList: boolean;
    openEditRequirements: () => void;
    togglePhotosList: () => void;
    showPhotosList: boolean;
    handlePickImage: () => void;
    removePhoto: (index: number) => void;

    // Vacancy
    isMultipleVacancy: boolean;
    setIsMultipleVacancy: (value: boolean) => void;
    vacancyCount: number;
    setVacancyCount: (count: number) => void;
    increaseVacancy: () => void;
    decreaseVacancy: () => void;

    // Location
    canBeDoneRemotely: boolean;
    setCanBeDoneRemotely: (value: boolean) => void;
    selectedLocation: LocationData | null;
    setSelectedLocation: (location: LocationData | null) => void;
    taskAddress: string;
    setTaskAddress: (address: string) => void;

    styles: any;
    colors: ThemeColors;
}

const JobDetailsForm: React.FC<JobDetailsFormProps> = ({
    selectedValue,
    categoryIcon,
    jobName,
    setJobName,
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
    removePhoto,
    isMultipleVacancy,
    setIsMultipleVacancy,
    vacancyCount,
    setVacancyCount,
    increaseVacancy,
    decreaseVacancy,
    canBeDoneRemotely,
    setCanBeDoneRemotely,
    selectedLocation,
    setSelectedLocation,
    taskAddress,
    setTaskAddress,
    styles,
    colors,
}) => {
    return (
        <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Category</Text>

            <View style={styles.selectedCategoryCard}>
                <View style={styles.premiumCategoryIconContainer}>
                    <Image source={categoryIcon} style={styles.categoryIconSmall} resizeMode="contain" />
                </View>
                <View style={styles.categoryTextContainer}>
                    <Text style={styles.categoryLabel}>CATEGORY</Text>
                    <Text style={styles.categoryValue}>{selectedValue || "Select Category"}</Text>
                </View>
                <View style={styles.editIconContainer}>
                    <Ionicons name="lock-closed-outline" size={16} color={colors.grey} />
                </View>
            </View>

            <View style={styles.row}>
                <Text style={styles.sectionTitle}>Job Name</Text>
            </View>

            <View style={styles.premiumInputContainer}>
                <TextInput
                    style={styles.premiumInput}
                    value={jobName}
                    onChangeText={setJobName}
                    placeholder="e.g. Clean my apartment"
                    placeholderTextColor={colors.grey}
                    maxLength={100}
                />
            </View>

            <View style={styles.row}>
                <Text style={styles.sectionTitle}>Describe Your Job</Text>
            </View>

            <JobDescriptionSection
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
                requirements={requirements}
                photos={photos}
                toggleRequirementsList={toggleRequirementsList}
                showRequirementsList={showRequirementsList}
                openEditRequirements={openEditRequirements}
                togglePhotosList={togglePhotosList}
                showPhotosList={showPhotosList}
                handlePickImage={handlePickImage}
            />

            <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Is this a multiple vacancy job?</Text>
                <CustomSwitch
                    value={isMultipleVacancy}
                    onValueChange={setIsMultipleVacancy}
                />
            </View>

            {isMultipleVacancy && (
                <View style={styles.vacancyContainer}>
                    <Text style={styles.vaccancyTitle}>Number of Vacancies</Text>
                    <View style={styles.counterContainer}>
                        <View style={styles.counterValueContainer}>
                            <Ionicons name="person-outline" size={24} color={colors.grey} />
                            <TextInput
                                style={styles.counterValue}
                                value={String(vacancyCount)}
                                onChangeText={(text) => {
                                    const numericValue = parseInt(text, 10);
                                    if (!isNaN(numericValue)) {
                                        setVacancyCount(numericValue);
                                    } else if (text === "") {
                                        setVacancyCount(0);
                                    }
                                }}
                                keyboardType="number-pad"
                                maxLength={3}
                                placeholder="0"
                                placeholderTextColor={colors.grey}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.counterButton}
                            onPress={decreaseVacancy}
                        >
                            <Text style={styles.counterButtonText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.counterButtonText}>|</Text>
                        <TouchableOpacity
                            style={styles.counterButton}
                            onPress={increaseVacancy}
                        >
                            <Text style={styles.counterButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Can this job be done remotely?</Text>
                <CustomSwitch
                    value={canBeDoneRemotely}
                    onValueChange={(value) => {
                        setCanBeDoneRemotely(value);
                        if (value) {
                            setSelectedLocation(null);
                            setTaskAddress("");
                        }
                    }}
                />
            </View> */}

            {!canBeDoneRemotely && (
                <View>
                    <Text style={styles.sectionTitle2}>Add Task Location</Text>
                    <LocationSearch
                        value={selectedLocation?.address || taskAddress}
                        onLocationSelect={(location) => {
                            setSelectedLocation(location);
                            setTaskAddress(
                                location.address || `${location.city}, ${location.state}`
                            );
                        }}
                        placeholder="Search for a location..."
                        style={{ marginBottom: 10 }}
                        showSavedAddresses={true}
                        showCurrentLocation={true}
                    />
                    <View style={styles.address2}>
                        <Text style={styles.addressHelperText}>
                            Exact task location is not shown publicly until a task is assigned
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

export default JobDetailsForm;
