import { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";
import CustomButton from "../../../components/CustomButton";
import * as ImagePicker from "expo-image-picker";
import { Calendar } from "react-native-calendars";
import { createStyles } from "./styles";
import CustomSwitch from "../../../components/CustomSwich";
import {
  createJobPosting,
  getCategories,
  // uploadJobPhotos
} from "../../../services/api"; // Adjust the path according to your project structure
import { LocationData } from "../../../services/locationService";
import Toast from "react-native-toast-message";
import { useAlert } from "../../../components/CustomAlert/AlertProvider";
import {
  validateJobTitle,
  validateJobDescription,
  validateHourlyRate,
} from "../../../utilities/formValidation";
import CategorySelector from "./components/CategorySelector";
import JobDetailsForm from "./components/JobDetailsForm";
import BudgetInput from "./components/BudgetInput";

import {
  defaultJobCategories,
  timeSlots,
} from "../../../constants/JobConstants";
import { RootState } from "../../../redux/store";
import Images from "../../../utilities/images";

const PostJobScreen = ({ navigation: navProp }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation();
  const { kycStatus } = useSelector((state: any) => state.authentication);
  const { showAlert } = useAlert();
  const scrollViewRef = useRef<ScrollView>(null);

  // State variables
  const [currentStep, setCurrentStep] = useState(1);
  const [jobCategories, setJobCategories] = useState(defaultJobCategories);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [jobName, setJobName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isMultipleVacancy, setIsMultipleVacancy] = useState(false);
  const [vacancyCount, setVacancyCount] = useState(1);
  const [canBeDoneRemotely, setCanBeDoneRemotely] = useState(false);
  const [taskAddress, setTaskAddress] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null
  );
  const [selectedTimePreferences, setSelectedTimePreferences] = useState([]); // Changed to array
  const [budget, setBudget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Date/Time mode - simplified state
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [scheduleType, setScheduleType] = useState<"on" | "before">("on");
  const [isFlexible, setIsFlexible] = useState(false);

  // Time range settings - fromTime and toTime are required for non-flexible jobs
  const [fromHour, setFromHour] = useState("00");
  const [fromMinute, setFromMinute] = useState("00");
  const [fromAmPm, setFromAmPm] = useState("AM");
  const [toHour, setToHour] = useState("00");
  const [toMinute, setToMinute] = useState("00");
  const [toAmPm, setToAmPm] = useState("AM");

  const [selectedValue, setSelectedValue] = useState("mail");
  const [requirements, setRequirements] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [newRequirement, setNewRequirement] = useState("");
  const [showRequirementsList, setShowRequirementsList] = useState(false);
  const [showPhotosList, setShowPhotosList] = useState(false);
  const [editingRequirements, setEditingRequirements] = useState(false);
  const [time, setTime] = useState(new Date());
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhotoUrls, setUploadedPhotoUrls] = useState([]);
  //const [user, setUser] = useState(null);
  const [categoryMapping, setCategoryMapping] = useState({});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const user = useSelector((state: RootState) => state.authentication.userData);
  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       // Use the same getCurrentUser function as HomeScreen
  //       const userData = await getCurrentUser();

  //       if (userData) {
  //         setUser(userData);
  //         console.log("Loaded user data in PostJob:", userData);
  //       } else {
  //         showAlert({
  //           type: "error",
  //           title: "Authentication Required",
  //           message: "Please log in to post a job.",
  //           buttons: [
  //             {
  //               text: "OK",
  //               onPress: () => {
  //                 navigation.navigate("Login");
  //               },
  //             },
  //           ],
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user data in PostJob:", error);
  //       showAlert({
  //         type: "error",
  //         title: "Error",
  //         message: "Unable to load user data. Please try logging in again.",
  //       });
  //     }
  //   };

  //   fetchUser();
  // }, []);

  // Fixed loadCategories function
  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await getCategories();
      console.log("Raw API response:", response);

      if (
        response.data &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        // Create mapping from frontend IDs to database IDs
        const mapping = {};

        // Map API categories to match your existing structure
        const apiCategories = response.data.data
          .map((category) => {
            console.log("Processing API category:", category);

            // Find matching default category by name (case insensitive)
            const matchingDefault = defaultJobCategories.find(
              (def) => def.name.toLowerCase() === category.name.toLowerCase()
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
                icon: matchingDefault.icon, // Use frontend icon
              };
            } else {
              // Handle categories that don't exist in defaults
              console.log(`No matching default found for: ${category.name}`);
              mapping[category._id] = category._id;
              return {
                id: category._id,
                backendId: category._id,
                name: category.name,
                icon: require("../../../assets/images/custom.png"),
              };
            }
          })
          .filter(Boolean); // Remove any null entries

        console.log("Final category mapping:", mapping);
        console.log("Final API categories:", apiCategories);

        setCategoryMapping(mapping);
        setJobCategories(apiCategories);
      } else {
        console.log("No API categories found, using defaults");
        // If no API categories, use defaults but create identity mapping
        const identityMapping = {};
        defaultJobCategories.forEach((cat) => {
          identityMapping[cat.id] = cat.id;
        });
        setCategoryMapping(identityMapping);
        setJobCategories(defaultJobCategories);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      // Create identity mapping for defaults
      const identityMapping = {};
      defaultJobCategories.forEach((cat) => {
        identityMapping[cat.id] = cat.id;
      });
      setCategoryMapping(identityMapping);
      setJobCategories(defaultJobCategories);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Format time to HH:MM format for backend
  const get24HourTime = (hour, minute, amPm) => {
    let h = parseInt(hour);
    if (amPm === "PM" && h !== 12) h += 12;
    if (amPm === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };

  // Helper function to validate time is within 12 AM to 11:59 PM range
  const isValidTimeRange = (hour, minute, amPm) => {
    // 12 AM to 11:59 PM is valid (00:00 to 23:59 in 24-hour format)
    const hour24 = parseInt(hour);
    const minute24 = parseInt(minute);

    if (amPm === "AM") {
      // AM: 12 AM (00:00) to 11:59 AM (11:59)
      return (hour24 === 12 && minute24 >= 0) || (hour24 >= 1 && hour24 <= 11);
    } else {
      // PM: 12 PM (12:00) to 11:59 PM (23:59)
      return hour24 >= 1 && hour24 <= 12;
    }
  };

  // Time picker increment/decrement functions for FROM time
  const incrementFromHour = () => {
    const newHour = parseInt(fromHour) + 1;
    if (newHour > 12) {
      setFromHour("1");
    } else {
      setFromHour(String(newHour));
    }
  };

  const decrementFromHour = () => {
    const newHour = parseInt(fromHour) - 1;
    if (newHour < 1) {
      setFromHour("12");
    } else {
      setFromHour(String(newHour));
    }
  };

  const incrementFromMinute = () => {
    const newMinute = parseInt(fromMinute) + 5;
    if (newMinute > 59) {
      setFromMinute("0");
    } else {
      setFromMinute(String(newMinute));
    }
  };

  const decrementFromMinute = () => {
    const newMinute = parseInt(fromMinute) - 5;
    if (newMinute < 0) {
      setFromMinute("59");
    } else {
      setFromMinute(String(newMinute));
    }
  };

  // Time picker increment/decrement functions for TO time
  const incrementToHour = () => {
    const newHour = parseInt(toHour) + 1;
    if (newHour > 12) {
      setToHour("1");
    } else {
      setToHour(String(newHour));
    }
  };

  const decrementToHour = () => {
    const newHour = parseInt(toHour) - 1;
    if (newHour < 1) {
      setToHour("12");
    } else {
      setToHour(String(newHour));
    }
  };

  const incrementToMinute = () => {
    const newMinute = parseInt(toMinute) + 5;
    if (newMinute > 59) {
      setToMinute("0");
    } else {
      setToMinute(String(newMinute));
    }
  };

  const decrementToMinute = () => {
    const newMinute = parseInt(toMinute) - 5;
    if (newMinute < 0) {
      setToMinute("59");
    } else {
      setToMinute(String(newMinute));
    }
  };

  // Validate form data before submission
  const validateJobData = () => {
    const errors = [];

    if (!selectedCategory) {
      errors.push("Please select a job category");
    }

    // Validate job title
    const titleValidation = validateJobTitle(jobName);
    if (!titleValidation.status) {
      errors.push(titleValidation.titleError);
    }

    // Validate job description
    const descriptionValidation = validateJobDescription(jobDescription);
    if (!descriptionValidation.status) {
      errors.push(descriptionValidation.descriptionError);
    }

    if (!canBeDoneRemotely && !selectedLocation) {
      errors.push("Please provide a location for onsite jobs");
    }

    // Validate budget/hourly rate
    const rateValidation = validateHourlyRate(budget?.toString() || "");
    if (!rateValidation.status) {
      errors.push(rateValidation.rateError);
    }

    // Validate time fields for non-flexible jobs
    if (!isFlexible) {
      if (!fromHour || !fromMinute || !fromAmPm) {
        errors.push("Please set the start time for the job");
      }
      if (!toHour || !toMinute || !toAmPm) {
        errors.push("Please set the end time for the job");
      }

      // Validate that end time is after start time
      if (fromHour && fromMinute && fromAmPm && toHour && toMinute && toAmPm) {
        const fromTime24 = get24HourTime(fromHour, fromMinute, fromAmPm);
        const toTime24 = get24HourTime(toHour, toMinute, toAmPm);

        if (fromTime24 >= toTime24) {
          errors.push("End time must be after start time");
        }
      }
    }

    if (errors.length > 0) {
      showAlert({
        type: "warning",
        title: "Validation Error",
        message: errors.join("\n"),
      });
      return false;
    }

    return true;
  };
  // const checkAuthStatus = async () => {
  //   try {
  //     // Use the same authentication check as HomeScreen
  //     const authValid = await isAuthenticated();

  //     console.log("PostJob Auth check result:", authValid);

  //     if (!authValid) {
  //       showAlert({
  //         type: "error",
  //         title: "Authentication Required",
  //         message: "Please log in to post a job.",
  //         buttons: [
  //           {
  //             text: "OK",
  //             onPress: () => {
  //               navigation.navigate("Login");
  //             },
  //           },
  //         ],
  //       });
  //       return false;
  //     }

  //     return true;
  //   } catch (error) {
  //     console.error("Error checking auth status in PostJob:", error);
  //     showAlert({
  //       type: "error",
  //       title: "Authentication Error",
  //       message:
  //         "Unable to verify authentication. Please try logging in again.",
  //     });
  //     return false;
  //   }
  // };

  const currentDate = new Date();

  // Helper function to combine date and time properly (IST → UTC)
  const combineDateAndTime = (
    dateString: string,
    hour: string,
    minute: string,
    amPm: "AM" | "PM"
  ) => {
    // Parse the date string (format: "YYYY-MM-DD")
    const [year, month, day] = dateString.split("-").map(Number);

    // Convert time to 24-hour format
    let hour24 = parseInt(hour, 10);
    if (amPm === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (amPm === "AM" && hour24 === 12) {
      hour24 = 0;
    }

    // Create date in local timezone (IST)
    const localDate = new Date(
      year,
      month - 1,
      day,
      hour24,
      parseInt(minute, 10),
      0,
      0
    );

    // Convert automatically to UTC string
    const utcString = localDate.toISOString();

    console.log(
      `🕐 Input: ${dateString} ${hour}:${minute} ${amPm} (IST assumed)`
    );
    console.log(
      `   Local time (IST): ${localDate.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })}`
    );
    console.log(`   UTC time: ${utcString}`);

    return utcString;
  };

  // Fixed formatJobData function
  const formatJobData = (photoUrls = []) => {
    if (!user || !user.id) {
      throw new Error("User data is not available");
    }

    // Get the backend category ID from the mapping
    const backendCategoryId = categoryMapping[selectedCategory];

    if (!backendCategoryId) {
      console.error("Category mapping not found for:", selectedCategory);
      console.error("Available mappings:", categoryMapping);
      throw new Error("Invalid category selection");
    }

    console.log("Selected category:", selectedCategory);
    console.log("Backend category ID from mapping:", backendCategoryId);

    const jobData: any = {
      userId: user.id,
      category: backendCategoryId, // Use the mapped backend ID
      name: jobName,
      description: jobDescription,
      isMultiVacancy: isMultipleVacancy,
      participantsNumber: isMultipleVacancy ? vacancyCount : 1,
      isRemote: canBeDoneRemotely,
      address: canBeDoneRemotely
        ? ""
        : selectedLocation?.address || taskAddress,
      requirements: requirements,
      photos: photoUrls,
      timePreference: selectedTimePreferences, // Send as array
      budget: parseFloat(budget),
      isOpen: true,
      createdAt: currentDate,
      updatedAt: currentDate,
    };

    // Add location data if available and not remote
    if (!canBeDoneRemotely && selectedLocation) {
      console.log(
        "Adding location to job data:",
        JSON.stringify(selectedLocation, null, 2)
      );
      jobData.location = selectedLocation;
    } else {
      console.log(
        "No location data added - remote:",
        canBeDoneRemotely,
        "selectedLocation:",
        !!selectedLocation
      );
    }

    // Handle simplified date/time
    if (!isFlexible && scheduleDate) {
      // If it's "On Date", we combine the date with the "From Time"
      // Since specific type selection is removed/hidden, we default to treating it as "onDate"
      const dateTime = combineDateAndTime(
        scheduleDate.toISOString().split("T")[0],
        fromHour,
        fromMinute,
        fromAmPm as "AM" | "PM"
      );
      jobData.onDate = dateTime;
      // jobData.scheduleType = "on"; // Removed as backend doesn't support it anymore

      jobData.isFlexible = false;
    } else {
      jobData.isFlexible = true;
      jobData.onDate = null;
    }

    // Add time fields ONLY if Exact Time is set
    if (isExactTime) {
      jobData.fromTime = get24HourTime(fromHour, fromMinute, fromAmPm);
      jobData.toTime = get24HourTime(toHour, toMinute, toAmPm);
      jobData.isFlexible = false;
    }
    // Else: we do not set fromTime/toTime, allowing for "Date Only" jobs
    // Backend validation has been relaxed to allow this.

    return jobData;
  };

  const resetAllFields = () => {
    // Reset step
    setCurrentStep(1);

    // Reset category
    setSelectedCategory(null);
    setSelectedValue("mail");

    // Reset job details
    setJobName("");
    setJobDescription("");
    setIsMultipleVacancy(false);
    setVacancyCount(1);
    setCanBeDoneRemotely(false);
    setTaskAddress("");
    setSelectedLocation(null);

    // Reset time preferences
    setSelectedTimePreferences([]);
    setScheduleDate(null);
    setScheduleType("on");
    setIsFlexible(false);
    setFromHour("00");
    setFromMinute("00");
    setFromAmPm("AM");
    setToHour("00");
    setToMinute("00");
    setToAmPm("AM");

    // Reset budget
    setBudget("200");

    // Reset requirements and photos
    setRequirements([]);
    setPhotos([]);
    setUploadedPhotoUrls([]);

    // Reset modals and UI states
    setShowRequirementsModal(false);
    setShowRequirementsList(false);
    setShowPhotosList(false);
    setEditingRequirements(false);
    setCalendarVisible(false);
    setShowMenu(false);
    setNewRequirement("");

    console.log("All form fields have been reset");
  };

  // Handle job posting
  // Debug handlePost function
  const handlePost = async () => {
    if (kycStatus !== "completed") {
      Toast.show({
        type: "info",
        text1: "KYC Required",
        text2: "Please complete your KYC to post jobs",
      });
      navigation.navigate("BankAccount");
      return;
    }

    if (!validateJobData()) {
      return;
    }

    // const isAuth = await checkAuthStatus();
    // if (!isAuth) {
    //   return;
    // }

    // Double-check user data is available
    if (!user || !user.id) {
      showAlert({
        type: "error",
        title: "User Error",
        message:
          "User information is not available. Please try logging in again.",
      });
      return;
    }

    console.log("Selected category before posting:", selectedCategory);
    console.log("Category mapping:", categoryMapping);
    console.log("Backend category ID:", categoryMapping[selectedCategory]);
    setIsSubmitting(true);
    setIsLoading(true);

    try {
      // Create job posting
      const jobData = formatJobData();
      console.log(
        "Final job data being sent:",
        JSON.stringify(jobData, null, 2)
      );

      const response = await createJobPosting(jobData);

      if (response.data) {
        showAlert({
          type: "success",
          title: "Success!",
          message: "Your job has been posted successfully!",
          buttons: [
            {
              text: "OK",
              onPress: () => {
                resetAllFields();
                navigation.goBack();
              },
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error posting job:", error);
      console.error("Error response data:", error.response?.data);

      let errorMessage = "Failed to post job. Please try again.";

      // Handle specific authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = "Authentication expired. Please log in again.";
        // Optionally navigate to login
        // navigation.navigate('Login');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        errorMessage = errors.join("\n");
      }

      showAlert({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };
  // Handle date selection from calendar
  const handleDateSelect = (day) => {
    // day object from react-native-calendars
    // { dateString: "2023-10-26", day: 26, month: 10, year: 2023, timestamp: ... }
    const date = new Date(day.dateString); // simplified parsing
    setScheduleDate(date);
    setCalendarVisible(false);
    setIsFlexible(false); // If they pick a date, it's not flexible by default
  };

  const formatDateForDisplay = (dateObj: Date | null) => {
    if (!dateObj) return "Select a date";
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const [isExactTime, setIsExactTime] = useState(false);

  // Sync time preference when exact time is changed
  useEffect(() => {
    if (isExactTime) {
      let hour24 = parseInt(fromHour);
      if (fromAmPm === "PM" && hour24 !== 12) hour24 += 12;
      if (fromAmPm === "AM" && hour24 === 12) hour24 = 0;

      let slotId = "";
      // Morning: Before 10 AM (6 AM - 10 AM)
      // Midday: 10 AM - 2 PM (10 AM - 2 PM)
      // Afternoon: 2 PM - 6 PM (2 PM - 6 PM)
      // Evening: After 6 PM (6 PM onwards)
      if (hour24 >= 6 && hour24 < 10) {
        slotId = "morning";
      } else if (hour24 >= 10 && hour24 < 14) {
        slotId = "midday";
      } else if (hour24 >= 14 && hour24 < 18) {
        slotId = "afternoon";
      } else if (hour24 >= 18 || hour24 < 6) {
        slotId = "evening";
      }

      if (slotId && !selectedTimePreferences.includes(slotId)) {
        setSelectedTimePreferences([slotId]);
      }
    }
  }, [fromHour, fromMinute, fromAmPm, isExactTime]);

  // Handle time preference selection (only one allowed)
  const handleTimePreferenceToggle = (timeSlotId, toggle = true) => {
    setSelectedTimePreferences((prev) => {
      let newSelection = [];
      if (toggle && prev.includes(timeSlotId)) {
        newSelection = []; // Deselect if already selected
      } else {
        newSelection = [timeSlotId]; // Select only this one
      }

      // Set default times if exact time is NOT enabled and we have a selection
      if (!isExactTime && newSelection.length > 0) {
        const selectedId = newSelection[0];
        switch (selectedId) {
          case "morning":
            setFromHour("06");
            setFromMinute("00");
            setFromAmPm("AM");
            setToHour("10");
            setToMinute("00");
            setToAmPm("AM");
            break;
          case "midday":
            setFromHour("10");
            setFromMinute("00");
            setFromAmPm("AM");
            setToHour("02");
            setToMinute("00");
            setToAmPm("PM");
            break;
          case "afternoon":
            setFromHour("02");
            setFromMinute("00");
            setFromAmPm("PM");
            setToHour("06");
            setToMinute("00");
            setToAmPm("PM");
            break;
          case "evening":
            setFromHour("06");
            setFromMinute("00");
            setFromAmPm("PM");
            setToHour("10");
            setToMinute("00");
            setToAmPm("PM");
            break;
        }
      }

      return newSelection;
    });
  };

  // Navigate to next step
  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 1 && !selectedCategory) {
      showAlert({
        type: "info",
        title: "Required",
        message: "Please select a job category",
      });
      return;
    }

    if (currentStep === 2) {
      if (!jobName) {
        showAlert({
          type: "info",
          title: "Required",
          message: "Please enter a job name",
        });
        return;
      }
      // if (!jobDescription) {
      //   showAlert({
      //     type: "info",
      //     title: "Required",
      //     message: "Please enter a job description",
      //   });
      //   return;
      // }
      if (!canBeDoneRemotely && !selectedLocation) {
        showAlert({
          type: "info",
          title: "Required",
          message: "Please provide a location for onsite jobs",
        });
        return;
      }

      // Debug logging
      console.log("Step 2 validation:", {
        canBeDoneRemotely,
        selectedLocation: !!selectedLocation,
        taskAddress,
      });
    }

    if (currentStep === 3) {
      // Validate that a date is selected
      if (!scheduleDate) {
        showAlert({
          type: "info",
          title: "Date Required",
          message: "Please select a date for your job",
        });
        return;
      }

      // Check if no time preference is selected
      if (selectedTimePreferences.length === 0) {
        showAlert({
          type: "info",
          title: "Time Preference Required",
          message: "Please select a time preference for your job",
        });
        return;
      }

      // Validate time fields for Exact Time jobs
      if (isExactTime) {
        if (!fromHour || !fromMinute || !fromAmPm) {
          showAlert({
            type: "info",
            title: "Required",
            message: "Please set the start time for the job",
          });
          return;
        }
        if (!toHour || !toMinute || !toAmPm) {
          showAlert({
            type: "info",
            title: "Required",
            message: "Please set the end time for the job",
          });
          return;
        }

        // Validate that end time is after start time
        const fromTime24 = get24HourTime(fromHour, fromMinute, fromAmPm);
        const toTime24 = get24HourTime(toHour, toMinute, toAmPm);

        if (fromTime24 >= toTime24) {
          showAlert({
            type: "warning",
            title: "Invalid Time",
            message: "End time must be after start time",
          });
          return;
        }
      }

      // Removed strict validation block for (!isFlexible && !isExactTime)
      // because we now support "Date Only" jobs without specific times.

      // Validate time selection when time preference is selected
      if (selectedTimePreferences.length > 0) {
        // Check if time is still at initial values (00:00 AM)
        if (
          fromHour === "00" &&
          fromMinute === "00" &&
          fromAmPm === "AM" &&
          toHour === "00" &&
          toMinute === "00" &&
          toAmPm === "AM"
        ) {
          showAlert({
            type: "info",
            title: "Time Selection Required",
            message: "Please select the time range for your job",
          });
          return;
        }

        // Validate that end time is after start time for time preferences
        const fromTime24 = get24HourTime(fromHour, fromMinute, fromAmPm);
        const toTime24 = get24HourTime(toHour, toMinute, toAmPm);

        if (fromTime24 >= toTime24) {
          showAlert({
            type: "warning",
            title: "Invalid Time",
            message: "End time must be after start time",
          });
          return;
        }

        // Validate time is within 12 AM to 11:59 PM range
        if (!isValidTimeRange(fromHour, fromMinute, fromAmPm)) {
          showAlert({
            type: "warning",
            title: "Invalid Time",
            message: "Start time must be between 12 AM and 11:59 PM",
          });
          return;
        }

        if (!isValidTimeRange(toHour, toMinute, toAmPm)) {
          showAlert({
            type: "warning",
            title: "Invalid Time",
            message: "End time must be between 12 AM and 11:59 PM",
          });
          return;
        }
      }
    }

    if (currentStep === 4 && (!budget || parseFloat(budget) <= 0)) {
      showAlert({
        type: "info",
        title: "Required",
        message: "Please enter a valid budget",
      });
      return;
    }

    setCurrentStep(currentStep + 1);
    // Scroll to top when moving to next step
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Navigate to previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Scroll to top when moving to previous step
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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
      setNewRequirement("");
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
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const getCategoryIcon = () => {
    const category = jobCategories.find((cat) => cat.id === selectedCategory);
    return category
      ? category.icon
      : require("../../../assets/placeholder-image.png");
  };

  // Render Step 1: Select Category
  const renderStep1 = () => (
    <CategorySelector
      categories={jobCategories}
      selectedCategory={selectedCategory}
      onSelect={(categoryId, categoryName) => {
        setSelectedCategory(categoryId);
        setSelectedValue(categoryName);
      }}
      styles={styles}
      loading={categoriesLoading}
    />
  );

  // Render Step 2: Job Details
  const renderStep2 = () => (
    <JobDetailsForm
      selectedValue={selectedValue}
      categoryIcon={getCategoryIcon()}
      jobName={jobName}
      setJobName={setJobName}
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
      removePhoto={removePhoto}
      isMultipleVacancy={isMultipleVacancy}
      setIsMultipleVacancy={setIsMultipleVacancy}
      vacancyCount={vacancyCount}
      setVacancyCount={setVacancyCount}
      increaseVacancy={increaseVacancy}
      decreaseVacancy={decreaseVacancy}
      canBeDoneRemotely={canBeDoneRemotely}
      setCanBeDoneRemotely={setCanBeDoneRemotely}
      selectedLocation={selectedLocation}
      setSelectedLocation={setSelectedLocation}
      taskAddress={taskAddress}
      setTaskAddress={setTaskAddress}
      styles={styles}
      colors={colors}
    />
  );

  // FIXED: Render Step 3: Time Preference (Simplified)
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>
        When does the job need to be done?
      </Text>

      {/* Date Picker Input */}
      {/* Date Picker Input */}
      <TouchableOpacity
        style={styles.selectedCategoryCard}
        onPress={() => setCalendarVisible(true)}
      >
        <View style={styles.premiumCategoryIconContainer}>
          <Ionicons name="calendar-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.categoryTextContainer}>
          <Text style={styles.categoryLabel}>SCHEDULE DATE</Text>
          <Text style={styles.categoryValue}>
            {scheduleDate ? formatDateForDisplay(scheduleDate) : "Select Date"}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.grey} />
      </TouchableOpacity>

      <Modal
        visible={isCalendarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={{
                [scheduleDate?.toISOString().split("T")[0] || ""]: {
                  selected: true,
                  selectedColor: colors.primary,
                },
              }}
              minDate={new Date().toISOString().split("T")[0]}
              theme={{
                todayTextColor: colors.primary,
                arrowColor: colors.primary,
                selectedDayBackgroundColor: colors.primary,
              }}
            />
            <TouchableOpacity
              style={{ marginTop: 16, padding: 12, alignItems: "center" }}
              onPress={() => setCalendarVisible(false)}
            >
              <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Only show Exact Time Toggle if Date is selected */}
      {scheduleDate && (
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Set Exact Time</Text>
          <CustomSwitch
            value={isExactTime}
            onValueChange={(value) => {
              setIsExactTime(value);
              if (!value) {
                if (selectedTimePreferences.length > 0) {
                  const pref = selectedTimePreferences[0];
                  handleTimePreferenceToggle(pref, false);
                }
              }
            }}
          />
        </View>
      )}

      {/* Show Time Preferences / Time Slots */}
      {!isExactTime && (
        <>
          <Text style={styles.sectionTitle}>Mention your time preference</Text>

          <View style={styles.timeSlotGrid}>
            {timeSlots.slice(0, 2).map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.timeSlot,
                  selectedTimePreferences.includes(slot.id) &&
                    styles.selectedTimeSlot,
                ]}
                onPress={() => handleTimePreferenceToggle(slot.id)}
              >
                <Image
                  source={
                    selectedTimePreferences.includes(slot.id)
                      ? slot.false
                      : slot.true
                  }
                  style={[
                    styles.timeSlotIcon,
                    {
                      tintColor: selectedTimePreferences.includes(slot.id)
                        ? colors.white
                        : colors.black,
                    },
                  ]}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.timeSlotName,
                    selectedTimePreferences.includes(slot.id)
                      ? { color: colors.white }
                      : { color: colors.black },
                  ]}
                >
                  {slot.name}
                </Text>
                <Text
                  style={[
                    styles.timeSlotTime,
                    selectedTimePreferences.includes(slot.id)
                      ? { color: colors.white }
                      : { color: colors.grey },
                  ]}
                >
                  {slot.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.timeSlotGrid}>
            {timeSlots.slice(2).map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.timeSlot,
                  selectedTimePreferences.includes(slot.id) &&
                    styles.selectedTimeSlot,
                ]}
                onPress={() => handleTimePreferenceToggle(slot.id)}
              >
                <Image
                  source={
                    selectedTimePreferences.includes(slot.id)
                      ? slot.false
                      : slot.true
                  }
                  style={[
                    styles.timeSlotIcon,
                    {
                      tintColor: selectedTimePreferences.includes(slot.id)
                        ? colors.white
                        : colors.black,
                    },
                  ]}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.timeSlotName,
                    selectedTimePreferences.includes(slot.id)
                      ? { color: colors.white }
                      : { color: colors.black },
                  ]}
                >
                  {slot.name}
                </Text>
                <Text
                  style={[
                    styles.timeSlotTime,
                    selectedTimePreferences.includes(slot.id)
                      ? { color: colors.white }
                      : { color: colors.grey },
                  ]}
                >
                  {slot.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Time Range Picker - Required for Exact Time jobs */}
      {isExactTime && (
        <View style={styles.timeRangeContainer}>
          <Text style={styles.sectionTitle}>Set time range (Required)</Text>

          {/* From Time */}
          <View style={styles.timeRangeSection}>
            <Text style={styles.timeRangeLabel}>From:</Text>
            <View style={styles.timePickerContainer}>
              <View style={styles.timePickerColumn}>
                <TouchableOpacity
                  onPress={incrementFromHour}
                  style={styles.timePickerArrow}
                >
                  <Ionicons name="chevron-up" size={24} color={colors.grey} />
                </TouchableOpacity>
                <Text style={styles.timePickerValue}>
                  {String(fromHour).padStart(2, "0")}
                </Text>
                <TouchableOpacity
                  onPress={decrementFromHour}
                  style={styles.timePickerArrow}
                >
                  <Ionicons name="chevron-down" size={24} color={colors.grey} />
                </TouchableOpacity>
              </View>

              <Text style={styles.timePickerSeparator}>:</Text>

              <View style={styles.timePickerColumn}>
                <TouchableOpacity
                  onPress={incrementFromMinute}
                  style={styles.timePickerArrow}
                >
                  <Ionicons name="chevron-up" size={24} color={colors.grey} />
                </TouchableOpacity>
                <Text style={styles.timePickerValue}>
                  {String(fromMinute).padStart(2, "0")}
                </Text>
                <TouchableOpacity
                  onPress={decrementFromMinute}
                  style={styles.timePickerArrow}
                >
                  <Ionicons name="chevron-down" size={24} color={colors.grey} />
                </TouchableOpacity>
              </View>

              <View style={styles.amPmContainer}>
                <TouchableOpacity
                  style={[
                    styles.amPmButton,
                    fromAmPm === "AM" && styles.selectedAmPm,
                  ]}
                  onPress={() => setFromAmPm("AM")}
                >
                  <Text
                    style={
                      fromAmPm === "AM" ? styles.amPmText2 : styles.amPmText
                    }
                  >
                    AM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.amPmButton,
                    fromAmPm === "PM" && styles.selectedAmPm,
                  ]}
                  onPress={() => setFromAmPm("PM")}
                >
                  <Text
                    style={
                      fromAmPm === "PM" ? styles.amPmText2 : styles.amPmText
                    }
                  >
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* To Time */}
          <View style={styles.timeRangeSection}>
            <Text style={styles.timeRangeLabel}>To:</Text>
            <View style={styles.timePickerContainer}>
              <View style={styles.timePickerColumn}>
                <TouchableOpacity
                  onPress={incrementToHour}
                  style={styles.timePickerArrow}
                >
                  <Ionicons name="chevron-up" size={24} color={colors.grey} />
                </TouchableOpacity>
                <Text style={styles.timePickerValue}>
                  {String(toHour).padStart(2, "0")}
                </Text>
                <TouchableOpacity
                  onPress={decrementToHour}
                  style={styles.timePickerArrow}
                >
                  <Ionicons name="chevron-down" size={24} color={colors.grey} />
                </TouchableOpacity>
              </View>

              <Text style={styles.timePickerSeparator}>:</Text>

              <View style={styles.timePickerColumn}>
                <TouchableOpacity
                  onPress={incrementToMinute}
                  style={styles.timePickerArrow}
                >
                  <Ionicons name="chevron-up" size={24} color={colors.grey} />
                </TouchableOpacity>
                <Text style={styles.timePickerValue}>
                  {String(toMinute).padStart(2, "0")}
                </Text>
                <TouchableOpacity
                  onPress={decrementToMinute}
                  style={styles.timePickerArrow}
                >
                  <Ionicons name="chevron-down" size={24} color={colors.grey} />
                </TouchableOpacity>
              </View>

              <View style={styles.amPmContainer}>
                <TouchableOpacity
                  style={[
                    styles.amPmButton,
                    toAmPm === "AM" && styles.selectedAmPm,
                  ]}
                  onPress={() => setToAmPm("AM")}
                >
                  <Text
                    style={toAmPm === "AM" ? styles.amPmText2 : styles.amPmText}
                  >
                    AM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.amPmButton,
                    toAmPm === "PM" && styles.selectedAmPm,
                  ]}
                  onPress={() => setToAmPm("PM")}
                >
                  <Text
                    style={toAmPm === "PM" ? styles.amPmText2 : styles.amPmText}
                  >
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  // Render Step 4: Budget
  const renderStep4 = () => (
    <BudgetInput
      budget={budget}
      setBudget={setBudget}
      styles={styles}
      colors={colors}
    />
  );
  const renderStep5 = () => {
    // Get category name from selected category ID
    const getCategoryName = () => {
      const category = jobCategories.find((cat) => cat.id === selectedCategory);
      return category ? category.name : selectedValue;
    };

    const getCategoryIcon = () => {
      const category = jobCategories.find((cat) => cat.id === selectedCategory);
      return category
        ? category.icon
        : require("../../../assets/placeholder-image.png");
    };
    const getTimePreferenceName = () => {
      if (selectedTimePreferences.length === 0) return "Flexible";
      const timeSlot = timeSlots.find(
        (slot) => slot.id === selectedTimePreferences[0]
      );
      return timeSlot ? timeSlot.name : "Flexible";
    };

    // Get time preference names
    const getFormattedDateTime = () => {
      if (isFlexible) return "Flexible";

      if (scheduleDate) {
        // Format: DD/MM/YYYY
        const day = String(scheduleDate.getDate()).padStart(2, "0");
        const month = String(scheduleDate.getMonth() + 1).padStart(2, "0");
        const year = scheduleDate.getFullYear();
        let result = `${day}/${month}/${year}`;
        if (fromHour && toHour && isExactTime) {
          const fromTime = `${fromHour}:${String(fromMinute).padStart(
            2,
            "0"
          )} ${fromAmPm}`;
          const toTime = `${toHour}:${String(toMinute).padStart(
            2,
            "0"
          )} ${toAmPm}`;
          result += ` ${fromTime} - ${toTime}`;
        } else if (
          selectedTimePreferences &&
          selectedTimePreferences.length > 0
        ) {
          const timeSlot = timeSlots.find(
            (slot) => slot.id === selectedTimePreferences[0]
          );
          if (timeSlot) {
            result += ` (${timeSlot.time})`;
          }
        }
        return result;
      }

      return "Flexible";
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
      setJobName("");
      setJobDescription("");
      setSelectedLocation(null);
      setTaskAddress("");
      setScheduleDate(null);
      setScheduleType("on");
      setCurrentStep(2);
      setShowMenu(false);
    };

    const handleRemoveJob = () => {
      showAlert({
        type: "warning",
        title: "Remove Job",
        message: "Are you sure you want to remove this job and clear all data?",
        buttons: [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              resetAllFields();
              setShowMenu(false);
            },
          },
        ],
      });
    };
    return (
      <View style={styles.stepContainer}>
        {/* Header with back button and title */}
        <View style={styles.previewHeader}>
          <View style={styles.previewActions}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Open</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.darkGreen}
              />
            </View>
            <TouchableOpacity onPress={toggleMenu}>
              <Ionicons
                name="ellipsis-vertical"
                size={20}
                color={colors.black}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Menu Dropdown */}
        {showMenu && (
          <View style={styles.menuContainer}>
            {/* <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
              <Ionicons
                name="share-social-outline"
                size={20}
                color={colors.black}
              />
              <Text style={styles.menuText}>Share</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <Ionicons name="create-outline" size={20} color={colors.black} />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.menuItem}
              onPress={handlePostSimilar}
            >
              <Ionicons name="copy-outline" size={20} color={colors.black} />
              <Text style={styles.menuText}>Post Similar Job</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.menuItem} onPress={handleRemoveJob}>
              <Ionicons name="trash-outline" size={20} color="red" />
              <Text style={[styles.menuText, { color: "red" }]}>
                Remove Job
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* User Profile */}
        <View style={styles.previewCard}>
          <View style={styles.previewLeftSection}>
            <View style={styles.profileSection}>
              {/* <Image
                   style={styles.avatarContainer}
                   source={{ uri: user.profilePictureUrl || user.profileImage }}

                /> */}

              <Image
                //key={`settings-${userData?.profilePictureUrl || userData?.profilePicture}`}
                source={{ uri: user.profilePictureUrl || user.profileImage }}
                style={[styles.avatarContainer]}
                placeholder={Images.profile.profileImage}
                placeholderContentFit="cover"
                contentFit="cover"
                cachePolicy="memory-disk"
                //transition={300}
              />
              <Text style={styles.userName}>
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.name || user?.fullName || "User"}
              </Text>
            </View>

            <Text style={styles.jobTitlePreview}>
              {jobName || "Furniture Lifting Help Needed"}
            </Text>

            <View style={styles.categoryBadge}>
              <Image
                style={styles.categoryIconSmall}
                source={getCategoryIcon()}
                resizeMode="contain"
              />
              <Text style={styles.categoryBadgeText}>
                {getCategoryName().toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.previewRightSection}>
            <View style={styles.categoryIconContainer}>
              <Image
                source={getCategoryIcon()}
                style={styles.categoryIconLarge}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* <View style={styles.separator} /> */}

        {/* Job Details */}
        <View style={styles.detailsSection}>
          <View style={[styles.detailRow, { marginBottom: 20 }]}>
            <Text style={styles.detailLabel}>BUDGET</Text>
            <Text style={styles.budget}>₹{budget || "500"}/person</Text>
          </View>
          {/* <View style={styles.separator} /> */}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>DATE</Text>
            <Text style={styles.detailValue}>
              {getFormattedDateTime() || "Mar 31, 2025\n2:00 pm"}
            </Text>
          </View>

          <View style={styles.row}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>WORK TYPE</Text>
              <Text style={styles.detailValue}>
                {canBeDoneRemotely ? "Remote" : "Onsite"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>NO. OF TASKERS REQUIRED</Text>
              <Text style={styles.detailValue}>
                {isMultipleVacancy ? vacancyCount : "01"}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>LOCATION</Text>
            <Text style={styles.detailValue}>
              {selectedLocation
                ? selectedLocation.address ||
                  `${selectedLocation.city}, ${selectedLocation.state}`
                : taskAddress || "Remote"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>DESCRIPTION</Text>
            <Text style={styles.descriptionValue}>{jobDescription}</Text>
          </View>
          {/* <View style={styles.separator} /> */}

          {/* Photos Section */}
          {photos.length > 0 && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>PHOTOS</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                bounces={false}
                style={styles.photosScrollView}
              >
                {photos.length > 0 &&
                  photos.map((photo, index) => (
                    <Image
                      key={index}
                      source={{ uri: photo }}
                      style={styles.previewPhoto}
                    />
                  ))}
              </ScrollView>
            </>
          )}

          {/* Requirements Section */}
          {requirements.length > 0 && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>REQUIREMENTS</Text>
              </View>
              <View style={styles.requirementsContainer}>
                {requirements.map((req, index) => (
                  <View key={index} style={styles.requirementItemPreview}>
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.requirementTextPreview}>{req}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
        {/* <View style={styles.separator} /> */}

        {/* Edit and Remove buttons at bottom */}
        {/* <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.editButton123} onPress={handleEdit}>
            <Ionicons name="create-outline" size={20} color={colors.grey} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveJob}
          >
            <Ionicons name="trash-outline" size={20} color="red" />
            <Text style={styles.removeButtonText}>Remove Job</Text>
          </TouchableOpacity>
        </View> */}
      </View>
    );
  };

  // Render progress steps at the top
  const renderProgressSteps = () => {
    const totalSteps = 5;

    return (
      <View style={styles.progressContainer}>
        {[...Array(totalSteps)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressStep,
              index < currentStep && styles.progressStepCompleted,
              index === currentStep - 1 && styles.progressStepCurrent,
            ]}
          />
        ))}
      </View>
    );
  };

  // Main render function
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} disabled={isSubmitting}>
          <Ionicons name="chevron-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Job</Text>
        <View style={{ width: 24 }} />
      </View>

      {renderProgressSteps()}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 30}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </ScrollView>

        {/* Fixed button container - always visible above keyboard */}
        <View
          style={{
            //paddingHorizontal: 20,
            paddingVertical: 16,
            //paddingBottom: Platform.OS === "ios" ? 20 : 16,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          {currentStep === 5 ? (
            <CustomButton
              text={"Post"}
              color={colors.primary}
              onPress={handlePost}
              disabled={isSubmitting}
            />
          ) : (
            <CustomButton
              text={"Next"}
              color={colors.primary}
              onPress={handleNext}
            />
          )}
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showRequirementsModal}
          onRequestClose={() => setShowRequirementsModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Add Requirements for the Job
                </Text>
                <TouchableOpacity
                  onPress={() => setShowRequirementsModal(false)}
                >
                  <Ionicons name="close" size={24} color={colors.grey} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalInputContainer}>
                <TextInput
                  style={styles.modalInput}
                  value={newRequirement}
                  onChangeText={setNewRequirement}
                  placeholder="Eg - Tools or Vehicles"
                  placeholderTextColor={colors.subGrey}
                  maxLength={100}
                />
                <TouchableOpacity
                  onPress={handleAddRequirement}
                  style={styles.addButton}
                >
                  <Ionicons
                    name="add-circle"
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              <CustomButton
                text="Add"
                color={colors.primary}
                onPress={handleAddRequirement}
              />
            </View>
          </View>
        </Modal>

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
                  <Ionicons name="close" size={24} color={colors.grey} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollContent} bounces={false}>
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
                    placeholderTextColor={colors.subGrey}
                    maxLength={100}
                  />
                  <TouchableOpacity
                    onPress={handleAddRequirement}
                    style={styles.addButton}
                  >
                    <Ionicons
                      name="add-circle"
                      size={24}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <CustomButton
                text="Update"
                color={colors.primary}
                onPress={() => setEditingRequirements(false)}
              />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
};

export default PostJobScreen;
