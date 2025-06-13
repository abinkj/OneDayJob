import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, FlatList, Modal, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DeviceDimensions from '../../../constants/DeviceDimenions';
import { Colors } from '../../../constants/Colors';
import CustomButton from '../../../components/CustomButton';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Calendar } from 'react-native-calendars';
import { styles } from './styles';
import CustomSwitch from '../../../components/CustomSwich';
import JobDescriptionSection from '../../../components/JobDescription';
import {
  createJobPosting,
  getCategories,
  // uploadJobPhotos 
} from '../../../services/api'; // Adjust the path according to your project structure
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default Job Categories (fallback if API fails)
const defaultJobCategories = [
  { id: 'cleaning', name: 'Cleaning', icon: require('../../../assets/images/cleaning.png') },
  { id: 'assembly', name: 'Assembly', icon: require('../../../assets/images/assembly.png') },
  { id: 'repair', name: 'Repair', icon: require('../../../assets/images/repair.png') },
  { id: 'delivery', name: 'Delivery', icon: require('../../../assets/images/delivery.png') },
  { id: 'yardwork', name: 'Yard Work', icon: require('../../../assets/images/yardwork.png') },
  { id: 'hauling', name: 'Hauling', icon: require('../../../assets/images/hauling.png') },
  { id: 'catering', name: 'Catering', icon: require('../../../assets/images/catering.png') },
  { id: 'painting', name: 'Painting', icon: require('../../../assets/images/paint.png') },
  { id: 'computer', name: 'Computer Fixing', icon: require('../../../assets/images/computer.png') },
  { id: 'custom', name: 'Custom', icon: require('../../../assets/images/custom.png') },
];

// Time Slot Data
const timeSlots = [
  { id: 'morning', name: 'Morning', time: 'Before 10AM', true: require('../../../assets/images/morning.png'), false: require('../../../assets/images/morningU.png') },
  { id: 'midday', name: 'Midday', time: '10AM - 2PM', true: require('../../../assets/images/midday.png'), false: require('../../../assets/images/middayU.png') },
  { id: 'afternoon', name: 'Afternoon', time: '2PM - 6PM', true: require('../../../assets/images/afternoon.png'), false: require('../../../assets/images/afternoonU.png') },
  { id: 'evening', name: 'Evening', time: 'After 6PM', true: require('../../../assets/images/evening.png'), false: require('../../../assets/images/eveningU.png') },
];

const PostJobScreen = ({ navigation }) => {
  // State variables
  const [currentStep, setCurrentStep] = useState(1);
  const [jobCategories, setJobCategories] = useState(defaultJobCategories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [jobName, setJobName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isMultipleVacancy, setIsMultipleVacancy] = useState(false);
  const [vacancyCount, setVacancyCount] = useState(1);
  const [canBeDoneRemotely, setCanBeDoneRemotely] = useState(false);
  const [taskAddress, setTaskAddress] = useState('');
  const [selectedTimePreferences, setSelectedTimePreferences] = useState([]); // Changed to array
  const [budget, setBudget] = useState('200');

  // Date/Time mode - only one should be active
  const [dateMode, setDateMode] = useState('flexible'); // 'flexible', 'onDate', 'beforeDate'
  const [onDate, setOnDate] = useState(null);
  const [beforeDate, setBeforeDate] = useState(null);
  const [isFlexible, setIsFlexible] = useState(true);

  // Exact time settings - FIXED
  const [isExactTime, setIsExactTime] = useState(false);
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
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhotoUrls, setUploadedPhotoUrls] = useState([]);
  const [user, setUser] = useState(null);
  const [categoryMapping, setCategoryMapping] = useState({});




  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("user");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUser(userData);
          console.log("Loaded user data:", userData);
        } else {
          Alert.alert("Error", "User data not found. Please log in again.");
          // Optionally navigate back to Login screen
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Something went wrong fetching user data.");
      }
    };

    fetchUser();
  }, []);
 

// Fixed loadCategories function
const loadCategories = async () => {
  try {
    const response = await getCategories();
    console.log('Raw API response:', response);
    
if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0){
      // Create mapping from frontend IDs to database IDs
      const mapping = {};
      
      // Map API categories to match your existing structure
      const apiCategories = response.data.data.map(category => {
        console.log('Processing API category:', category);
        
        // Find matching default category by name (case insensitive)
        const matchingDefault = defaultJobCategories.find(
          def => def.name.toLowerCase() === category.name.toLowerCase()
        );
        
        if (matchingDefault) {
          // Store the mapping: frontend ID -> backend ID
          mapping[matchingDefault.id] = category._id;
          console.log(`Mapped ${matchingDefault.id} -> ${category._id}`);
          
          // Use the frontend ID but store backend ID in mapping
          return {
            id: matchingDefault.id, // Keep frontend ID for UI consistency
            backendId: category._id, // Store backend ID separately
            name: category.name,
            icon: matchingDefault.icon // Use frontend icon
          };
        } else {
          // Handle categories that don't exist in defaults
          console.log(`No matching default found for: ${category.name}`);
          mapping[category._id] = category._id;
          return {
            id: category._id,
            backendId: category._id,
            name: category.name,
            icon: require('../../../assets/images/custom.png')
          };
        }
      }).filter(Boolean); // Remove any null entries

      console.log('Final category mapping:', mapping);
      console.log('Final API categories:', apiCategories);
      
      setCategoryMapping(mapping);
      setJobCategories(apiCategories);
    } else {
      console.log('No API categories found, using defaults');
      // If no API categories, use defaults but create identity mapping
      const identityMapping = {};
      defaultJobCategories.forEach(cat => {
        identityMapping[cat.id] = cat.id;
      });
      setCategoryMapping(identityMapping);
      setJobCategories(defaultJobCategories);
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    // Create identity mapping for defaults
    const identityMapping = {};
    defaultJobCategories.forEach(cat => {
      identityMapping[cat.id] = cat.id;
    });
    setCategoryMapping(identityMapping);
    setJobCategories(defaultJobCategories);
  }
};


  // Format exact time to HH:MM format for backend
  const getSelectedTime = () => {
    const date = new Date();
    let h = amPm === 'PM' && hour !== 12 ? hour + 12 : hour;
    if (amPm === 'AM' && hour === 12) h = 0;
    date.setHours(h);
    date.setMinutes(minute);
    return date;
  };

  // Time picker increment/decrement functions
  const incrementHour = () => {
    const newHour = parseInt(hour) + 1;
    if (newHour > 12) {
      setHour('1');
    } else {
      setHour(String(newHour));
    }
  };

  const decrementHour = () => {
    const newHour = parseInt(hour) - 1;
    if (newHour < 1) {
      setHour('12');
    } else {
      setHour(String(newHour));
    }
  };

  const incrementMinute = () => {
    const newMinute = parseInt(minute) + 5;
    if (newMinute > 59) {
      setMinute('0');
    } else {
      setMinute(String(newMinute));
    }
  };

  const decrementMinute = () => {
    const newMinute = parseInt(minute) - 5;
    if (newMinute < 0) {
      setMinute('59');
    } else {
      setMinute(String(newMinute));
    }
  };

  const get24HourTime = (hour, minute, amPm) => {
    let h = parseInt(hour);
    if (amPm === 'PM' && h !== 12) h += 12;
    if (amPm === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  // Validate form data before submission
  const validateJobData = () => {
    const errors = [];

    if (!selectedCategory) {
      errors.push('Please select a job category');
    }

    if (!jobName || jobName.length < 10) {
      errors.push('Job name must be at least 10 characters long');
    }

    if (!jobDescription || jobDescription.length < 25) {
      errors.push('Job description must be at least 25 characters long');
    }

    if (!canBeDoneRemotely && !taskAddress) {
      errors.push('Please provide a task address for onsite jobs');
    }

    if (!budget || parseFloat(budget) <= 0) {
      errors.push('Please enter a valid budget');
    }

    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return false;
    }

    return true;
  };
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userString = await AsyncStorage.getItem('user');

      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      console.log('User data:', userString);

      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again.');
        // Navigate to login screen
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  };


  const currentDate = new Date();


// Fixed formatJobData function
const formatJobData = (photoUrls = []) => {
  if (!user || !user.id) {
    throw new Error('User data is not available');
  }

  // Get the backend category ID from the mapping
  const backendCategoryId = categoryMapping[selectedCategory];
  
  if (!backendCategoryId) {
    console.error('Category mapping not found for:', selectedCategory);
    console.error('Available mappings:', categoryMapping);
    throw new Error('Invalid category selection');
  }

  console.log("Selected category:", selectedCategory);
  console.log("Backend category ID from mapping:", backendCategoryId);

  const jobData = {
    userId: user.id,
    category: backendCategoryId, // Use the mapped backend ID
    name: jobName,
    description: jobDescription,
    isMultiVacancy: isMultipleVacancy,
    participantsNumber: isMultipleVacancy ? vacancyCount : 1,
    isRemote: canBeDoneRemotely,
    address: canBeDoneRemotely ? '' : taskAddress,
    requirements: requirements,
    photos: photoUrls,
    timePreference: selectedTimePreferences, // Send as array
    budget: parseFloat(budget),
    isOpen: true,
    createdAt: currentDate,
    updatedAt: currentDate
  };

  // Handle date/time based on mode
  if (dateMode === 'onDate' && onDate) {
    jobData.onDate = new Date(onDate);
    jobData.isFlexible = false;
  } else if (dateMode === 'beforeDate' && beforeDate) {
    jobData.beforeDate = new Date(beforeDate);
    jobData.isFlexible = false;
  } else {
    jobData.isFlexible = true;
  }

  if (isExactTime) {
    jobData.fromTime = get24HourTime(hour, minute, amPm);
    // If you need toTime, calculate it (e.g., +1 hour)
    jobData.toTime = get24HourTime(hour, minute, amPm);
  }
  
  return jobData;
};

  // Handle job posting
// Debug handlePost function
const handlePost = async () => {
  if (!validateJobData()) {
    return;
  }
  
  const isAuth = await checkAuthStatus();
  if (!isAuth) {
    return;
  }

  console.log('Selected category before posting:', selectedCategory);
  console.log('Category mapping:', categoryMapping);
  console.log('Backend category ID:', categoryMapping[selectedCategory]);

  setIsLoading(true);

  try {
    // Create job posting
    const jobData = formatJobData();
    console.log('Final job data being sent:', jobData);
    
    const response = await createJobPosting(jobData);

    if (response.data) {
      Alert.alert(
        'Success!',
        'Your job has been posted successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back or to job list
              navigation.goBack();
            }
          }
        ]
      );
    }
  } catch (error) {
    console.error('Error posting job:', error);
    console.error('Error response data:', error.response?.data);

    let errorMessage = 'Failed to post job. Please try again.';

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors) {
      const errors = Object.values(error.response.data.errors).flat();
      errorMessage = errors.join('\n');
    }

    Alert.alert('Error', errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  // Handle date mode selection
  const handleDateModeChange = (mode) => {
    setDateMode(mode);
    if (mode === 'flexible') {
      setIsFlexible(true);
      setOnDate(null);
      setBeforeDate(null);
    } else {
      setIsFlexible(false);
      if (mode !== 'onDate') setOnDate(null);
      if (mode !== 'beforeDate') setBeforeDate(null);
    }
  };

  // Handle calendar date selection
  const handleDateSelect = (day) => {
    const selectedDateString = day.dateString;

    if (dateMode === 'onDate') {
      setOnDate(selectedDateString);
    } else if (dateMode === 'beforeDate') {
      setBeforeDate(selectedDateString);
    }

    setSelectedDate(selectedDateString);
    setCalendarVisible(false);
  };

  // Handle time preference selection (multiple allowed)
  const handleTimePreferenceToggle = (timeSlotId) => {
    setSelectedTimePreferences(prev => {
      if (prev.includes(timeSlotId)) {
        return prev.filter(id => id !== timeSlotId);
      } else {
        return [...prev, timeSlotId];
      }
    });
  };

  // Navigate to next step
  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 1 && !selectedCategory) {
      Alert.alert('Required', 'Please select a job category');
      return;
    }

    if (currentStep === 2) {
      if (!jobName || jobName.length < 10) {
        Alert.alert('Required', 'Job name must be at least 10 characters long');
        return;
      }
      if (!jobDescription || jobDescription.length < 25) {
        Alert.alert('Required', 'Job description must be at least 25 characters long');
        return;
      }
      if (!canBeDoneRemotely && !taskAddress) {
        Alert.alert('Required', 'Please provide a task address for onsite jobs');
        return;
      }
    }

    if (currentStep === 4 && (!budget || parseFloat(budget) <= 0)) {
      Alert.alert('Required', 'Please enter a valid budget');
      return;
    }

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

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

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
                setSelectedValue(category.name);
              }}
            >
              <Image source={category.icon} style={styles.categoryIcon} resizeMode='contain' />
            </TouchableOpacity>
            <Text style={styles.categoryName}>{category.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // Render Step 2: Job Details
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Category</Text>
      <View style={styles.dropContainer}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={(itemValue, itemIndex) => {
            setSelectedValue(itemValue);
            const category = jobCategories.find(cat => cat.name === itemValue);
            if (category) {
              setSelectedCategory(category.id);
            }
          }}
          style={styles.picker}
          dropdownIconColor={Colors.border}
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

      {/* Unified Job Description Section */}
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
              <Ionicons name="person-outline" size={24} color={Colors.grey} />
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
              />
            </View>
            <TouchableOpacity style={styles.counterButton} onPress={decreaseVacancy}>
              <Text style={styles.counterButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.counterButtonText}>|</Text>
            <TouchableOpacity style={styles.counterButton} onPress={increaseVacancy}>
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Can this job be done remotely?</Text>
        <CustomSwitch
          value={canBeDoneRemotely}
          onValueChange={setCanBeDoneRemotely}
        />
      </View>
      {!canBeDoneRemotely && (
        <View>
          <Text style={styles.sectionTitle2}>Add Task Address</Text>
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={20} color={Colors.grey} />
            <TextInput
              style={styles.addressInput}
              value={taskAddress}
              onChangeText={setTaskAddress}
              placeholder="Address"
              placeholderTextColor={Colors.grey}
            />
          </View>
          <View style={styles.address2}>
            <Text style={styles.addressHelperText}>
              Exact task address is not shown publicly until a task is assigned
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  // FIXED: Render Step 3: Time Preference
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>When does the job need to be done?</Text>

      <View style={styles.timeOptionContainer}>
        <TouchableOpacity
          style={[styles.timeOption, dateMode === 'onDate' && styles.selectedTimeOption]}
          onPress={() => {
            handleDateModeChange('onDate');
            setCalendarVisible(true);
          }}
        >
          <Text style={styles.timeOptionText}>On Date</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.black} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timeOption, dateMode === 'beforeDate' && styles.selectedTimeOption]}
          onPress={() => {
            handleDateModeChange('beforeDate');
            setCalendarVisible(true);
          }}
        >
          <Text style={styles.timeOptionText}>Before date</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.black} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timeOption, dateMode === 'flexible' && styles.selectedTimeOption]}
          onPress={() => handleDateModeChange('flexible')}
        >
          <Text style={styles.timeOptionText}>I am Flexible</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isCalendarVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: 'blue',
                },
              }}
              minDate={new Date().toISOString().split('T')[0]} // Prevent past dates
            />
            <View style={styles.row}>
              <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                <Text style={{ textAlign: 'center', marginTop: 10, color: 'blue' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                <Text style={{ textAlign: 'center', marginTop: 10, color: 'blue' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {dateMode !== 'flexible' && selectedDate && (
        <Text style={styles.dateText}>
          {dateMode === 'onDate' ? 'On Date' : 'Before Date'}: {selectedDate}
        </Text>
      )}

      <Text style={styles.sectionTitle}>Mention your time preference</Text>

      <View style={styles.timeSlotGrid}>
        {timeSlots.slice(0, 2).map(slot => (
          <TouchableOpacity
            key={slot.id}
            style={[
              styles.timeSlot,
              selectedTimePreferences.includes(slot.id) && styles.selectedTimeSlot
            ]}
            onPress={() => handleTimePreferenceToggle(slot.id)}
          >
            <Image
              source={selectedTimePreferences.includes(slot.id) ? slot.false : slot.true}
              style={styles.timeSlotIcon}
              resizeMode='contain'
            />
            <Text style={[
              styles.timeSlotName,
              selectedTimePreferences.includes(slot.id) ? { color: Colors.white } : { color: Colors.black }
            ]}>
              {slot.name}
            </Text>
            <Text style={[
              styles.timeSlotTime,
              selectedTimePreferences.includes(slot.id) ? { color: Colors.white } : { color: Colors.grey }
            ]}>
              {slot.time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.timeSlotGrid}>
        {timeSlots.slice(2).map(slot => (
          <TouchableOpacity
            key={slot.id}
            style={[
              styles.timeSlot,
              selectedTimePreferences.includes(slot.id) && styles.selectedTimeSlot
            ]}
            onPress={() => handleTimePreferenceToggle(slot.id)}
          >
            <Image
              source={selectedTimePreferences.includes(slot.id) ? slot.false : slot.true}
              style={styles.timeSlotIcon}
              resizeMode='contain'
            />
            <Text style={[
              styles.timeSlotName,
              selectedTimePreferences.includes(slot.id) ? { color: Colors.white } : { color: Colors.black }
            ]}>
              {slot.name}
            </Text>
            <Text style={[
              styles.timeSlotTime,
              selectedTimePreferences.includes(slot.id) ? { color: Colors.white } : { color: Colors.grey }
            ]}>
              {slot.time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Exact Time Switch */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Set exact time</Text>
        <CustomSwitch
          value={isExactTime}
          onValueChange={setIsExactTime}
        />
      </View>

      {/* Exact Time Picker */}
      {isExactTime && (
        <View style={styles.timePickerContainer}>
          <View style={styles.timePickerColumn}>
            <TouchableOpacity onPress={incrementHour} style={styles.timePickerArrow}>
              <Ionicons name="chevron-up" size={24} color={Colors.grey} />
            </TouchableOpacity>
            <Text style={styles.timePickerValue}>{String(hour).padStart(2, '0')}</Text>
            <TouchableOpacity onPress={decrementHour} style={styles.timePickerArrow}>
              <Ionicons name="chevron-down" size={24} color={Colors.grey} />
            </TouchableOpacity>
          </View>

          <Text style={styles.timePickerSeparator}>:</Text>

          <View style={styles.timePickerColumn}>
            <TouchableOpacity onPress={incrementMinute} style={styles.timePickerArrow}>
              <Ionicons name="chevron-up" size={24} color={Colors.grey} />
            </TouchableOpacity>
            <Text style={styles.timePickerValue}>{String(minute).padStart(2, '0')}</Text>
            <TouchableOpacity onPress={decrementMinute} style={styles.timePickerArrow}>
              <Ionicons name="chevron-down" size={24} color={Colors.grey} />
            </TouchableOpacity>
          </View>

          <View style={styles.amPmContainer}>
            <TouchableOpacity
              style={[styles.amPmButton, amPm === 'AM' && styles.selectedAmPm]}
              onPress={() => setAmPm('AM')}
            >
              <Text style={amPm === 'AM' ? styles.amPmText2 : styles.amPmText}>AM</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.amPmButton, amPm === 'PM' && styles.selectedAmPm]}
              onPress={() => setAmPm('PM')}
            >
              <Text style={amPm === 'PM' ? styles.amPmText2 : styles.amPmText}>PM</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  // Render Step 4: Budget
  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Enter Your Budget</Text>

      <View style={styles.budgetContainer}>
        <Text style={styles.currencyText}>₹</Text>
        <TextInput
          style={styles.currencySymbol}
          value={budget}
          onChangeText={setBudget}
          placeholder='200'
          keyboardType='number-pad'
        />
      </View>
    </View>
  );

  const renderStep5 = () => {
    // Get category name from selected category ID
    const getCategoryName = () => {
      const category = jobCategories.find(cat => cat.id === selectedCategory);
      return category ? category.name : selectedValue;
    };
    const getTimePreferenceName = () => {
      const timeSlot = timeSlots.find(slot => slot.id === selectedTimePreferences);
      return timeSlot ? timeSlot.name : 'Flexible';
    };

    // Get time preference names
    const getFormattedDateTime = () => {
      if (!selectedDate) return 'Flexible';

      let result = selectedDate;
      if (isExactTime) {
        result += ` ${hour}:${String(minute).padStart(2, '0')} ${amPm}`;
      } else if (selectedTimePreferences) {
        const timeSlot = timeSlots.find(slot => slot.id === selectedTimePreferences);
        if (timeSlot) {
          result += ` (${timeSlot.time})`;
        }
      }
      return result;
    };
    const toggleMenu = () => {
      setShowMenu(!showMenu);
    };

    // Handle actions
    const handleShare = () => {
      // Implement share functionality
      setShowMenu(false);
    };

    const handleEdit = () => {
      // Go back to step 2 to edit job details
      setCurrentStep(2);
      setShowMenu(false);
    };

    const handlePostSimilar = () => {
      // Reset certain fields but keep others
      setJobName('');
      setJobDescription('');
      setSelectedDate(null);
      setOnDate(null);
      setBeforeDate(null);
      setCurrentStep(2);
      setShowMenu(false);
    };

    const handleRemoveJob = () => {
      // Implement job removal logic
      // For now, just go back to step 1
      setCurrentStep(1);
      setSelectedCategory(null);
      setJobName('');
      setJobDescription('');
      setRequirements([]);
      setPhotos([]);
      setTaskAddress('');
      setSelectedTimePreferences([]);
      setSelectedDate(null);
      setOnDate(null);
      setBeforeDate(null);
      setBudget('200');
      setShowMenu(false);
      setIsMultipleVacancy(false);

    };

    return (
      <View style={styles.stepContainer}>
        {/* Header with back button and title */}
        <View style={styles.previewHeader}>
          <View style={styles.previewActions}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Open</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.darkGreen} />
            </View>
            <TouchableOpacity onPress={toggleMenu}>
              <Ionicons name="ellipsis-vertical" size={20} color={Colors.black} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Menu Dropdown */}
        {showMenu && (
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={20} color={Colors.black} />
              <Text style={styles.menuText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <Ionicons name="create-outline" size={20} color={Colors.black} />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handlePostSimilar}>
              <Ionicons name="copy-outline" size={20} color={Colors.black} />
              <Text style={styles.menuText}>Post Similar Job</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleRemoveJob}>
              <Ionicons name="trash-outline" size={20} color="red" />
              <Text style={[styles.menuText, { color: 'red' }]}>Remove Job</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* User Profile */}
        <View style={styles.nameContainer}>
          <View style={styles.nameContainer1}>
            <View>
              <View style={styles.profileSection}>
                <Image style={styles.avatarContainer} source={require('../../../assets/images/profile/profile.png')} />
                <Text style={styles.userName}>John Doe</Text>
              </View>
              <Text style={styles.jobTitlePreview}>{jobName || 'Furniture Lifting Help Needed'}</Text>
              <View style={styles.categoryBadge}>
                <Image style={styles.avatarContainer} source={require('../../../assets/images/cleaning.png')} />
                <Text style={styles.categoryBadgeText}>{getCategoryName().toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.separator} />


          </View>
          <View style={styles.nameContainer2}>
            <Image source={require('../../../assets/placeholder-image.png')} style={styles.userImage} />
          </View>

        </View>




        {/* Job Details */}
        <View style={styles.detailsSection}>
          <View style={[styles.detailRow, { marginBottom: 20 }]}>
            <Text style={styles.detailLabel}>BUDGET</Text>
            <Text style={styles.budget}>₹{budget || '500'}/hr</Text>
          </View>
          <View style={styles.separator} />


          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>DATE</Text>
            <Text style={styles.detailValue}>{getFormattedDateTime() || 'Mar 31, 2025\n2:00 pm'}</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>WORK TYPE</Text>
              <Text style={styles.detailValue}>{canBeDoneRemotely ? 'Remote' : 'Onsite'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>NO. OF TASKERS REQUIRED</Text>
              <Text style={styles.detailValue}>{isMultipleVacancy ? vacancyCount : '02'}</Text>
            </View>

          </View>



          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>LOCATION</Text>
            <Text style={styles.detailValue}>{taskAddress || 'Downtown, New York'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>DESCRIPTION</Text>
            <Text style={styles.descriptionValue}>
              {jobDescription || 'I need two people to help move furniture from my second-floor apartment to a moving truck. It includes a sofa, bed, and a few boxes. The task should take around an hour.'}
            </Text>
          </View>
          <View style={styles.separator} />

          {/* Photos Section */}
          {(photos.length > 0) && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>PHOTOS</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScrollView}>
                {photos.length > 0 &&
                  photos.map((photo, index) => (
                    <Image key={index} source={{ uri: photo }} style={styles.previewPhoto} />
                  ))
                }
              </ScrollView>
            </>
          )}

          {/* Requirements Section */}
          {(requirements.length > 0 || true) && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>REQUIREMENTS</Text>
              </View>
              <View style={styles.requirementsContainer}>
                {requirements.length > 0 ?
                  requirements.map((req, index) => (
                    <View key={index} style={styles.requirementItemPreview}>
                      <Ionicons name="checkmark" size={16} color={Colors.primary} />
                      <Text style={styles.requirementTextPreview}>{req}</Text>
                    </View>
                  )) :
                  <View style={styles.requirementItemPreview}>
                    <Ionicons name="checkmark" size={16} color={Colors.primary} />
                    <Text style={styles.requirementTextPreview}>Pick up van</Text>
                  </View>
                }
              </View>
            </>
          )}
        </View>
        <View style={styles.separator} />


        {/* Edit and Remove buttons at bottom */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.editButton123} onPress={handleEdit}>
            <Ionicons name="create-outline" size={20} color={Colors.grey} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.removeButton} onPress={handleRemoveJob}>
            <Ionicons name="trash-outline" size={20} color="red" />
            <Text style={styles.removeButtonText}>Remove Job</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
        {currentStep === 5 && renderStep5()}
      </ScrollView>
      {/* <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity> */}
      {currentStep === 5 ? (
        <CustomButton text={'Post'} color={Colors.grey} onPress={handlePost} />
      ) : (
        <CustomButton text={'Next'} color={Colors.grey} onPress={handleNext} />
      )}

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