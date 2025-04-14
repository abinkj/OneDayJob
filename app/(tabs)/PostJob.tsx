import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Switch, FlatList, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DeviceDimensions from '../../constants/DeviceDimenions';
import { Colors } from '../../constants/Colors';
import CustomButton from '../../components/CustomButton';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import RNDateTimePicker from '@react-native-community/datetimepicker';

// Job Category Data
const jobCategories = [
  { id: 'cleaning', name: 'Cleaning', icon: require('../../assets/images/cleaning.png') },
  { id: 'assembly', name: 'Assembly', icon: require('../../assets/images/assembly.png') },
  { id: 'repair', name: 'Repair', icon: require('../../assets/images/repair.png') },
  { id: 'delivery', name: 'Delivery', icon: require('../../assets/images/delivery.png') },
  { id: 'yardwork', name: 'Yard Work', icon: require('../../assets/images/yardwork.png') },
  { id: 'hauling', name: 'Hauling', icon: require('../../assets/images/hauling.png') },
  { id: 'catering', name: 'Catering', icon: require('../../assets/images/catering.png') },
  { id: 'painting', name: 'Painting', icon: require('../../assets/images/paint.png') },
  { id: 'computer', name: 'Computer Fixing', icon: require('../../assets/images/computer.png') },
  { id: 'custom', name: 'Custom', icon: require('../../assets/images/custom.png') },
];

// Time Slot Data
const timeSlots = [
  { id: 'morning', name: 'Morning', icon: 'sunny-outline', time: 'Before 10AM' },
  { id: 'midday', name: 'Midday', icon: 'sunny', time: '10AM - 2PM' },
  { id: 'afternoon', name: 'Afternoon', icon: 'partly-sunny-outline', time: '2PM - 6PM' },
  { id: 'evening', name: 'Evening', icon: 'moon-outline', time: 'After 6PM' },
];

const PostJobScreen = ({ navigation }) => {
  // State variables
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [jobName, setJobName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isMultipleVacancy, setIsMultipleVacancy] = useState(false);
  const [vacancyCount, setVacancyCount] = useState(1);
  const [canBeDoneRemotely, setCanBeDoneRemotely] = useState(false);
  const [taskAddress, setTaskAddress] = useState('');
  const [selectedTimePreference, setSelectedTimePreference] = useState(null);
  const [isExactTime, setIsExactTime] = useState(false);
  const [budget, setBudget] = useState('200');
  const [timeMode, setTimeMode] = useState('On Date');
  const [hour, setHour] = useState('10');
  const [minute, setMinute] = useState('30');
  const [amPm, setAmPm] = useState('AM');
  const [selectedValue, setSelectedValue] = useState("mail");
  const [requirements, setRequirements] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');
  const [showRequirementsList, setShowRequirementsList] = useState(false);
  const [showPhotosList, setShowPhotosList] = useState(false);
  const [editingRequirements, setEditingRequirements] = useState(false);
  const [time, setTime] = useState(new Date());


  // Navigate to next step
  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  // Navigate to previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  // Increase vacancy count
  const increaseVacancy = () => {
    setVacancyCount(vacancyCount + 1);
  };

  // Decrease vacancy count
  const decreaseVacancy = () => {
    if (vacancyCount > 1) {
      setVacancyCount(vacancyCount - 1);
    }
  };

  // Toggle the requirements section
  const toggleRequirementsList = () => {
    if (!showRequirementsList && requirements.length === 0) {
      setShowRequirementsModal(true);
    } else {
      setShowRequirementsList(!showRequirementsList);
    }
  };

  // Toggle the photos section
  const togglePhotosList = () => {
    if (!showPhotosList && photos.length === 0) {
      handlePickImage();
    } else {
      setShowPhotosList(!showPhotosList);
    }
  };

  // Handle adding a new requirement
  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement]);
      setNewRequirement('');
      setShowRequirementsModal(false);
      setShowRequirementsList(true);
    }
  };

  // Remove a requirement at a specific index
  const removeRequirement = (index) => {
    const updatedRequirements = [...requirements];
    updatedRequirements.splice(index, 1);
    setRequirements(updatedRequirements);

    if (updatedRequirements.length === 0) {
      setShowRequirementsList(false);
    }
  };

  // Handle picking images from the device's library
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newPhotos = [...photos, ...result.assets.map((asset) => asset.uri)];
      setPhotos(newPhotos);
      setShowPhotosList(true);
    }
  };

  // Remove a photo at a specific index
  const removePhoto = (index) => {
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index, 1);
    setPhotos(updatedPhotos);

    if (updatedPhotos.length === 0) {
      setShowPhotosList(false);
    }
  };

  // Open requirements edit modal
  const openEditRequirements = () => {
    setEditingRequirements(true);
  };

  const onChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTime(selectedDate);
    }
  };


  // Render Step 1: Select Category
  const renderStep1 = () => (
    <View style={{ paddingBottom: 20 }}>
      <Text style={styles.categoryText}>Select Category</Text>
      <View style={styles.categoryContainer}>
        {jobCategories.map(category => (
          <View style={styles.CategoryView} key={category.id}>
            <TouchableOpacity
              style={[
                styles.categoryItem,
                selectedCategory === category.id && styles.selectedCategory
              ]}
              onPress={() => {
                setSelectedCategory(category.id);
              }}
            >
              <Image source={category.icon} style={styles.categoryIcon} />
            </TouchableOpacity>
            <Text style={styles.categoryName}>{category.name}</Text>
          </View>
        ))}
      </View>
      <CustomButton text={'Next'} color={Colors.grey} onPress={handleNext} />
    </View>
  );

  // Render Step 2: Job Details
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Category</Text>
      <View style={styles.dropContainer}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={(itemValue) => setSelectedValue(itemValue)}
          style={styles.picker}
          dropdownIconColor={Colors.grey}
          mode="dropdown"
        >
          {jobCategories.map((option) => (
            <Picker.Item
              key={option.id}
              label={option.name}
              value={option.name}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.row}>
        <Text style={styles.sectionTitle}>Job Name</Text>
        <Text style={styles.inputHelper}>Minimum 10 Characters</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={jobName}
          onChangeText={setJobName}
          placeholder="Name"
          placeholderTextColor={Colors.subGrey}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.sectionTitle}>Describe Your Job</Text>
        <Text style={styles.inputHelper}>Minimum 25 Characters</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textArea}
          value={jobDescription}
          onChangeText={setJobDescription}
          placeholder="Add a detailed description about the job you wanted to done"
          placeholderTextColor={Colors.grey}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Requirements Section */}
      <TouchableOpacity style={styles.optionContainer} onPress={toggleRequirementsList}>
        <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
        <Text style={styles.optionText}>Add Requirements</Text>
        <Ionicons name="information-circle-outline" size={24} color={Colors.primary} style={styles.infoIcon} />
      </TouchableOpacity>

      {showRequirementsList && (
        <View style={styles.expandedSection}>
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

      {/* Photos Section */}
      <TouchableOpacity style={[styles.optionContainer, showRequirementsList && { marginTop: 12 }]} onPress={togglePhotosList}>
        <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
        <Text style={styles.optionText}>Add Photos</Text>
        <Ionicons name="information-circle-outline" size={24} color={Colors.primary} style={styles.infoIcon} />
      </TouchableOpacity>

      {showPhotosList && (
        <View style={styles.expandedSection}>
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

      {/* <View style={styles.optionContainer}>
        <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
        <Text style={styles.optionText}>Add Requirements</Text>
        <Ionicons name="information-circle-outline" size={24} color={Colors.primary} style={styles.infoIcon} />
      </View>

      <View style={styles.optionContainer}>
        <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
        <Text style={styles.optionText}>Add Photos</Text>
        <Ionicons name="information-circle-outline" size={24} color={Colors.primary} style={styles.infoIcon} />
      </View> */}

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Is this a multiple vacancy job?</Text>
        <Switch
          value={isMultipleVacancy}
          onValueChange={setIsMultipleVacancy}
          trackColor={{ false: Colors.grey, true: Colors.primary }}
          thumbColor={Colors.white}
        />
      </View>

      {isMultipleVacancy && (
        <View style={styles.vacancyContainer}>
          <Text style={styles.sectionTitle}>Number of Vacancies</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity style={styles.counterButton} onPress={decreaseVacancy}>
              <Text style={styles.counterButtonText}>−</Text>
            </TouchableOpacity>
            <View style={styles.counterValueContainer}>
              <Ionicons name="person" size={16} color={Colors.grey} />
              <Text style={styles.counterValue}>{vacancyCount}</Text>
            </View>
            <TouchableOpacity style={styles.counterButton} onPress={increaseVacancy}>
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Can this job be done remotely?</Text>
        <Switch
          value={canBeDoneRemotely}
          onValueChange={setCanBeDoneRemotely}
          trackColor={{ false: Colors.grey, true: Colors.primary }}
          thumbColor={Colors.white}
        />
      </View>
      {!canBeDoneRemotely && (
        <View>
          <Text style={styles.sectionTitle}>Add Task Address</Text>
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={20} color={Colors.grey} />
            <TextInput
              style={styles.addressInput}
              value={taskAddress}
              onChangeText={setTaskAddress}
              placeholder="Mail/Exp"
              placeholderTextColor={Colors.grey}
            />
          </View>
          <Text style={styles.addressHelperText}>
            Exact task address is not shown publicly until a task is assigned
          </Text>
        </View>

      )}


      <CustomButton text={'Next'} color={Colors.grey} onPress={handleNext} />
    </View>

  );

  // Render Step 3: Time Preference
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>When the job need to be done?</Text>

      <View style={styles.timeOptionContainer}>
        <TouchableOpacity
          style={[styles.timeOption, timeMode === 'On Date' && styles.selectedTimeOption]}
          onPress={() => setTimeMode('On Date')}
        >
          <Text style={styles.timeOptionText}>On Date</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeOption, timeMode === 'Before date' && styles.selectedTimeOption]}
          onPress={() => setTimeMode('Before date')}
        >
          <Text style={styles.timeOptionText}>Before date</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeOption, timeMode === 'I am Flexible' && styles.selectedTimeOption]}
          onPress={() => setTimeMode('I am Flexible')}
        >
          <Text style={styles.timeOptionText}>I am Flexible</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Mention your time preference</Text>

      <View style={styles.timeSlotGrid}>
        {timeSlots.slice(0, 2).map(slot => (
          <TouchableOpacity
            key={slot.id}
            style={[
              styles.timeSlot,
              selectedTimePreference === slot.id && styles.selectedTimeSlot
            ]}
            onPress={() => setSelectedTimePreference(slot.id)}
          >
            <Ionicons name={slot.icon} size={24} color={Colors.grey} style={styles.timeSlotIcon} />
            <Text style={styles.timeSlotName}>{slot.name}</Text>
            <Text style={styles.timeSlotTime}>{slot.time}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.timeSlotGrid}>
        {timeSlots.slice(2).map(slot => (
          <TouchableOpacity
            key={slot.id}
            style={[
              styles.timeSlot,
              selectedTimePreference === slot.id && styles.selectedTimeSlot
            ]}
            onPress={() => setSelectedTimePreference(slot.id)}
          >
            <Ionicons name={slot.icon} size={24} color={Colors.grey} style={styles.timeSlotIcon} />
            <Text style={styles.timeSlotName}>{slot.name}</Text>
            <Text style={styles.timeSlotTime}>{slot.time}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Set exact time</Text>
        <Switch
          value={isExactTime}
          onValueChange={setIsExactTime}
          trackColor={{ false: Colors.grey, true: Colors.primary }}
          thumbColor={Colors.white}
        />
      </View>

      {isExactTime && (
        <View style={styles.timePickerContainer}>
          {/* <View style={styles.timePickerColumn}>
            <TouchableOpacity style={styles.timePickerArrow}>
              <Ionicons name="chevron-up" size={24} color={Colors.grey} />
            </TouchableOpacity>
            <Text style={styles.timePickerValue}>{hour}</Text>
            <TouchableOpacity style={styles.timePickerArrow}>
              <Ionicons name="chevron-down" size={24} color={Colors.grey} />
            </TouchableOpacity>
          </View>

          <Text style={styles.timePickerSeparator}>:</Text>

          <View style={styles.timePickerColumn}>
            <TouchableOpacity style={styles.timePickerArrow}>
              <Ionicons name="chevron-up" size={24} color={Colors.grey} />
            </TouchableOpacity>
            <Text style={styles.timePickerValue}>{minute}</Text>
            <TouchableOpacity style={styles.timePickerArrow}>
              <Ionicons name="chevron-down" size={24} color={Colors.grey} />
            </TouchableOpacity>
          </View>

          <View style={styles.amPmContainer}>
            <TouchableOpacity
              style={[styles.amPmButton, amPm === 'AM' && styles.selectedAmPm]}
              onPress={() => setAmPm('AM')}
            >
              <Text style={styles.amPmText}>AM</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.amPmButton, amPm === 'PM' && styles.selectedAmPm]}
              onPress={() => setAmPm('PM')}
            >
              <Text style={styles.amPmText}>PM</Text>
            </TouchableOpacity>
          </View> */}
  <RNDateTimePicker
          value={time}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onChange}
          timeZoneOffsetInMinutes={330} // India Standard Time (UTC+5:30)
        />        </View>
      )}
      <CustomButton text={'Next'} color={Colors.grey} onPress={handleNext} />

    </View>
  );

  // Render Step 4: Budget
  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Enter Your Budget</Text>

      <View style={styles.budgetContainer}>
        <TextInput style={styles.currencySymbol}
          placeholder='$200'
          keyboardType='number-pad'></TextInput>
      </View>
      {/* 
      <View style={styles.numpadContainer}>
        <View style={styles.numpadRow}>
          <TouchableOpacity style={styles.numpadButton} onPress={() => setBudget(budget + '1')}>
            <Text style={styles.numpadButtonText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.numpadButton} onPress={() => setBudget(budget + '2')}>
            <Text style={styles.numpadButtonText}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.numpadButton} onPress={() => setBudget(budget + '3')}>
            <Text style={styles.numpadButtonText}>3</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.numpadRow}>
          <TouchableOpacity style={styles.numpadButton} onPress={() => setBudget(budget + '4')}>
            <Text style={styles.numpadButtonText}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.numpadButton} onPress={() => setBudget(budget + '5')}>
            <Text style={styles.numpadButtonText}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.numpadButton} onPress={() => setBudget(budget + '6')}>
            <Text style={styles.numpadButtonText}>6</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.numpadRow}>
          <TouchableOpacity style={styles.numpadButton} onPress={() => setBudget(budget + '7')}>
            <Text style={styles.numpadButtonText}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.numpadButton} onPress={() => setBudget(budget + '8')}>
            <Text style={styles.numpadButtonText}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.numpadButton} onPress={() => setBudget(budget + '9')}>
            <Text style={styles.numpadButtonText}>9</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.numpadRow}>
          <TouchableOpacity style={styles.numpadButton} onPress={() => setBudget(budget + '0')}>
            <Text style={styles.numpadButtonText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.numpadButton} onPress={() => setBudget(budget.slice(0, -1))}>
            <Ionicons name="backspace-outline" size={24} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </View> */}
      <CustomButton text={'Next'} color={Colors.grey} onPress={handleNext} />

    </View>
  );

  // Render progress steps at the top
  const renderProgressSteps = () => {
    const totalSteps = 5;

    return (
      <View style={styles.progressContainer}>
        {[...Array(totalSteps)].map((_, index) => (
          <View key={index} style={[
            styles.progressStep,
            index < currentStep && styles.progressStepCompleted,
            index === currentStep - 1 && styles.progressStepCurrent
          ]} />
        ))}
      </View>
    );
  };

  // Main render function
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Job</Text>
        <View style={{ width: 24 }} />
      </View>

      {renderProgressSteps()}

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </ScrollView>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRequirementsModal}
        onRequestClose={() => setShowRequirementsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Requirements for the Job</Text>
              <TouchableOpacity onPress={() => setShowRequirementsModal(false)}>
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalInputContainer}>
              <TextInput
                style={styles.modalInput}
                value={newRequirement}
                onChangeText={setNewRequirement}
                placeholder="Eg - Tools or Vehicles"
                placeholderTextColor={Colors.subGrey}
              />
              <TouchableOpacity onPress={handleAddRequirement} style={styles.addButton}>
                <Ionicons name="add-circle" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <CustomButton text="Add" color={Colors.primary} onPress={handleAddRequirement} />
          </View>
        </View>
      </Modal>

      {/* Edit Requirements Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editingRequirements}
        onRequestClose={() => setEditingRequirements(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Requirements</Text>
              <TouchableOpacity onPress={() => setEditingRequirements(false)}>
                <Ionicons name="close" size={24} color={Colors.grey} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollContent}>
              {requirements.map((req, index) => (
                <View key={index} style={styles.editRequirementItem}>
                  <Text style={styles.requirementText}>{req}</Text>
                  <TouchableOpacity onPress={() => removeRequirement(index)}>
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.modalInputContainer}>
                <TextInput
                  style={styles.modalInput}
                  value={newRequirement}
                  onChangeText={setNewRequirement}
                  placeholder="Add new requirement"
                  placeholderTextColor={Colors.subGrey}
                />
                <TouchableOpacity onPress={handleAddRequirement} style={styles.addButton}>
                  <Ionicons name="add-circle" size={24} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </ScrollView>

            <CustomButton text="Update" color={Colors.primary} onPress={() => setEditingRequirements(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PostJobScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16 * DeviceDimensions.widthRatio,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16 * DeviceDimensions.heightRatio,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'bold',
    color: Colors.black,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24 * DeviceDimensions.heightRatio,
  },
  progressStep: {
    flex: 1,
    height: 4 * DeviceDimensions.heightRatio,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 2 * DeviceDimensions.widthRatio,
    borderRadius: 2,
  },
  progressStepCompleted: {
    backgroundColor: Colors.primary,
  },
  progressStepCurrent: {
    backgroundColor: Colors.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'bold',
    color: Colors.black,
    marginBottom: 8 * DeviceDimensions.heightRatio,
  },
  categoryGrid: {

    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30 * DeviceDimensions.heightRatio,
    paddingHorizontal: 20
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allows items to wrap into new rows automatically
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  CategoryView: {

    height: 96 * DeviceDimensions.heightRatio,
    marginBottom: 40 * DeviceDimensions.heightRatio,
    width: `30%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryItem: {
    width: 71 * DeviceDimensions.widthRatio,
    height: 71 * DeviceDimensions.heightRatio,
    backgroundColor: Colors.categoryBox,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  categoryItemHighlighted: {
    borderColor: Colors.primary,
    borderWidth: 0,
  },
  selectedCategory: {
    backgroundColor: Colors.selected,
  },
  categoryIcon: {
    width: 32 * DeviceDimensions.widthRatio,
    height: 32 * DeviceDimensions.heightRatio,
  },
  categoryText: {
    fontSize: 16,
    fontFamily: 'medium',
    color: Colors.black,
    marginBottom: 26,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'regular',
    color: Colors.black,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24 * DeviceDimensions.heightRatio,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12 * DeviceDimensions.widthRatio,
    paddingVertical: 12 * DeviceDimensions.heightRatio,
    fontSize: 16,
    fontFamily: 'regular',
    color: Colors.black,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12 * DeviceDimensions.widthRatio,
    fontSize: 16,
    fontFamily: 'regular',
    color: Colors.black,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 120 * DeviceDimensions.heightRatio,
    textAlignVertical: 'top',
  },
  inputHelper: {
    fontSize: 12,
    fontFamily: 'regular',
    color: Colors.subGrey,
    marginTop: 4 * DeviceDimensions.heightRatio,
    textAlign: 'right',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16 * DeviceDimensions.widthRatio,
    //marginBottom: 16 * DeviceDimensions.heightRatio,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'regular',
    color: Colors.black,
    marginLeft: 8 * DeviceDimensions.widthRatio,
    flex: 1,
  },
  infoIcon: {
    marginLeft: 8 * DeviceDimensions.widthRatio,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24 * DeviceDimensions.heightRatio,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'regular',
    color: Colors.black,
    flex: 1,
  },
  vacancyContainer: {
    marginBottom: 24 * DeviceDimensions.heightRatio,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 40 * DeviceDimensions.widthRatio,
    height: 40 * DeviceDimensions.heightRatio,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.grey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    fontSize: 20,
    fontFamily: 'bold',
    color: Colors.black,
  },
  counterValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12 * DeviceDimensions.widthRatio,
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginHorizontal: 16 * DeviceDimensions.widthRatio,
    flex: 1,
    justifyContent: 'center',
  },
  counterValue: {
    fontSize: 16,
    fontFamily: 'regular',
    color: Colors.black,
    marginLeft: 8 * DeviceDimensions.widthRatio,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12 * DeviceDimensions.widthRatio,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8 * DeviceDimensions.heightRatio,
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'regular',
    color: Colors.black,
    marginLeft: 8 * DeviceDimensions.widthRatio,
  },
  addressHelperText: {
    fontSize: 12,
    fontFamily: 'regular',
    color: Colors.grey,
    marginBottom: 24 * DeviceDimensions.heightRatio,
  },
  timeOptionContainer: {
    flexDirection: 'row',
    marginBottom: 24 * DeviceDimensions.heightRatio,
  },
  timeOption: {
    flex: 1,
    padding: 12 * DeviceDimensions.widthRatio,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.grey,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8 * DeviceDimensions.widthRatio,
  },
  selectedTimeOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  timeOptionText: {
    fontSize: 14,
    fontFamily: 'regular',
    color: Colors.black,
  },
  timeSlotGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16 * DeviceDimensions.heightRatio,
  },
  timeSlot: {
    width: 160 * DeviceDimensions.widthRatio,
    height: 100 * DeviceDimensions.heightRatio,
    backgroundColor: Colors.white,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16 * DeviceDimensions.widthRatio,
  },
  selectedTimeSlot: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  timeSlotIcon: {
    marginBottom: 8 * DeviceDimensions.heightRatio,
  },
  timeSlotName: {
    fontSize: 16,
    fontFamily: 'medium',
    color: Colors.black,
    marginBottom: 4 * DeviceDimensions.heightRatio,
  },
  timeSlotTime: {
    fontSize: 12,
    fontFamily: 'regular',
    color: Colors.grey,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16 * DeviceDimensions.heightRatio,
  },
  timePickerColumn: {
    alignItems: 'center',
  },
  timePickerArrow: {
    padding: 8 * DeviceDimensions.widthRatio,
  },
  timePickerValue: {
    fontSize: 24,
    fontFamily: 'bold',
    color: Colors.black,
    marginVertical: 8 * DeviceDimensions.heightRatio,
  },
  timePickerSeparator: {
    fontSize: 24,
    fontFamily: 'bold',
    color: Colors.black,
    marginHorizontal: 16 * DeviceDimensions.widthRatio,
  },
  amPmContainer: {
    marginLeft: 24 * DeviceDimensions.widthRatio,
  },
  amPmButton: {
    padding: 8 * DeviceDimensions.widthRatio,
    borderRadius: 4,
    marginBottom: 8 * DeviceDimensions.heightRatio,
  },
  selectedAmPm: {
    backgroundColor: Colors.primary,
  },
  amPmText: {
    fontSize: 16,
    fontFamily: 'medium',
    color: Colors.black,
  },
  budgetContainer: {
    alignItems: 'center',
    marginVertical: 24 * DeviceDimensions.heightRatio,
  },
  currencySymbol: {
    fontSize: 36,
    fontFamily: 'bold',
    color: Colors.black,
    width: '100%',
    height: 100,
    textAlign: 'center'
  },
  numpadContainer: {
    marginTop: 16 * DeviceDimensions.heightRatio,
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24 * DeviceDimensions.heightRatio,
  },
  numpadButton: {
    width: 80 * DeviceDimensions.widthRatio,
    height: 80 * DeviceDimensions.heightRatio,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  numpadButtonText: {
    fontSize: 24,
    fontFamily: 'bold',
    color: Colors.black,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16 * DeviceDimensions.widthRatio,
    alignItems: 'center',
    marginTop: 16 * DeviceDimensions.heightRatio,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'bold',
    color: Colors.white,
  },
  dropContainer: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'regular',
    color: Colors.black,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden', // Important for picker border radius
    marginBottom: 19 * DeviceDimensions.heightRatio,
    paddingHorizontal: 12 * DeviceDimensions.widthRatio,

  },
  picker: {
    width: '100%',
    color: Colors.black,
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  photoThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 8,
  },
  expandedSection: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12 * DeviceDimensions.widthRatio,
    marginBottom: 12 * DeviceDimensions.heightRatio,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8 * DeviceDimensions.heightRatio,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  requirementText: {
    fontSize: 14,
    fontFamily: 'regular',
    color: Colors.black,
    marginLeft: 8 * DeviceDimensions.widthRatio,
    flex: 1,
  },
  editButton: {
    alignSelf: 'flex-end',
    padding: 8 * DeviceDimensions.widthRatio,
  },
  photoContainer: {
    marginRight: 8 * DeviceDimensions.widthRatio,
  },

  buttonContainer: {
    marginTop: 24 * DeviceDimensions.heightRatio,
    marginBottom: 16 * DeviceDimensions.heightRatio,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16 * DeviceDimensions.widthRatio,
    paddingBottom: 32 * DeviceDimensions.heightRatio,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16 * DeviceDimensions.heightRatio,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'medium',
    color: Colors.black,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16 * DeviceDimensions.heightRatio,
  },
  modalInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12 * DeviceDimensions.widthRatio,
    paddingVertical: 12 * DeviceDimensions.heightRatio,
    fontSize: 16,
    fontFamily: 'regular',
    color: Colors.black,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addButton: {
    marginLeft: 8 * DeviceDimensions.widthRatio,
  },
  modalScrollContent: {
    maxHeight: 300 * DeviceDimensions.heightRatio,
    marginBottom: 16 * DeviceDimensions.heightRatio,
  },
  editRequirementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12 * DeviceDimensions.heightRatio,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

}); 