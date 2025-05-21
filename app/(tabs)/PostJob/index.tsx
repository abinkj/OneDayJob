import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, FlatList, Modal, Switch } from 'react-native';
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

// Job Category Data
const jobCategories = [
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
  const [timeMode, setTimeMode] = useState('I am Flexible');
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





  const incrementHour = () => setHour(prev => (prev % 12) + 1);
  const decrementHour = () => setHour(prev => (prev - 1 < 1 ? 12 : prev - 1));

  const incrementMinute = () => setMinute(prev => (prev + 5) % 60);
  const decrementMinute = () => setMinute(prev => (prev - 5 < 0 ? 55 : prev - 5));

  const getSelectedTime = () => {
    const date = new Date();
    let h = amPm === 'PM' && hour !== 12 ? hour + 12 : hour;
    if (amPm === 'AM' && hour === 12) h = 0;
    date.setHours(h);
    date.setMinutes(minute);
    return date;
  };



  // Navigate to next step
  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };
  const handlePost  = () =>{

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
              }}
            >
              <Image source={category.icon} style={styles.categoryIcon} resizeMode='contain' />
            </TouchableOpacity>
            <Text style={styles.categoryName}>{category.name}</Text>
          </View>
        ))}
      </View>
      {/* <CustomButton text={'Next'} color={Colors.grey} onPress={handleNext} /> */}
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


      {/* <CustomButton text={'Next'} color={Colors.grey} onPress={handleNext} /> */}
    </View>

  );

  // Render Step 3: Time Preference
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>When the job need to be done?</Text>

      <View style={styles.timeOptionContainer}>
        <TouchableOpacity
          style={[styles.timeOption, timeMode === 'On Date' && styles.selectedTimeOption]}
          onPress={() => {
            setTimeMode('On Date');
            setCalendarVisible(true);
          }}
        >
          <Text style={styles.timeOptionText}>On Date</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.black} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timeOption, timeMode === 'Before date' && styles.selectedTimeOption]}
          onPress={() => {
            setTimeMode('Before date');
            setCalendarVisible(true);
          }}
        >
          <Text style={styles.timeOptionText}>Before date</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.black} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeOption, timeMode === 'I am Flexible' && styles.selectedTimeOption]}
          onPress={() => setTimeMode('I am Flexible')}
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
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setCalendarVisible(false);
              }}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: 'blue',
                },
              }}
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
      {timeMode !== 'I am Flexible' && (
        <Text style={styles.dateText}>{timeMode}: {selectedDate}</Text>
      )}


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
            <Image source={selectedTimePreference === slot.id ? slot.false : slot.true} style={styles.timeSlotIcon} resizeMode='contain' />
            <Text style={[styles.timeSlotName, selectedTimePreference === slot.id ? { color: Colors.white } : { color: Colors.black }]}>{slot.name}</Text>
            <Text style={[styles.timeSlotTime, selectedTimePreference === slot.id ? { color: Colors.white } : { color: Colors.grey }]}>{slot.time}</Text>
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
            <Image source={selectedTimePreference === slot.id ? slot.false : slot.true} style={styles.timeSlotIcon} resizeMode='contain' />
            <Text style={[styles.timeSlotName, selectedTimePreference === slot.id ? { color: Colors.white } : { color: Colors.black }]}>{slot.name}</Text>
            <Text style={[styles.timeSlotTime, selectedTimePreference === slot.id ? { color: Colors.white } : { color: Colors.grey }]}>{slot.time}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Set exact time</Text>
        <CustomSwitch
          value={isExactTime}
          onValueChange={setIsExactTime}
        />
      </View>

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

      {/* <CustomButton text={'Next'} color={Colors.grey} onPress={handleNext} /> */}

    </View>
  );

  // Render Step 4: Budget
  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Enter Your Budget</Text>

      <View style={styles.budgetContainer}>
        <Text style={styles.currencyText}>₹</Text>
        <TextInput style={styles.currencySymbol}
          placeholder='200'
          keyboardType='number-pad'></TextInput>
      </View>

      {/* <View style={{ position:'absolute',bottom:30}}>
      <CustomButton text={'Next'} color={Colors.grey} onPress={handleNext} />
      </View> */}


    </View>

  );

  const renderStep5 = () => {

    // Get category name from selected category ID
    const getCategoryName = () => {
      const category = jobCategories.find(cat => cat.id === selectedCategory);
      return category ? category.name : selectedValue;
    };

    // Get time preference name
    const getTimePreferenceName = () => {
      const timeSlot = timeSlots.find(slot => slot.id === selectedTimePreference);
      return timeSlot ? timeSlot.name : 'Flexible';
    };

    // Format the selected date and time
    const getFormattedDateTime = () => {
      if (!selectedDate) return 'Flexible';

      let result = selectedDate;
      if (isExactTime) {
        result += ` ${hour}:${String(minute).padStart(2, '0')} ${amPm}`;
      } else if (selectedTimePreference) {
        const timeSlot = timeSlots.find(slot => slot.id === selectedTimePreference);
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
      setSelectedTimePreference(null);
      setSelectedDate(null);
      setBudget('200');
      setShowMenu(false);
      setIsMultipleVacancy(false);
      setCanBeDoneRemotely(false);

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

