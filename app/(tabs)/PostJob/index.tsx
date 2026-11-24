import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  KeyboardAvoidingView,
  BackHandler,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
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
  updateJobPosting,
  getCategories,
  // uploadJobPhotos
} from "../../../services/api"; // Adjust the path according to your project structure
import { useQueryClient } from "@tanstack/react-query";
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
  defaultPermanentCategories,
  timeSlots,
} from "../../../constants/JobConstants";
import { RootState } from "../../../redux/store";
import Images from "../../../utilities/images";
import JobPostSuccessModal from "../../../components/JobPostSuccessModal";

const PostJobScreen = ({ navigation: navProp }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const { kycStatus } = useSelector((state: any) => state.authentication);
  const { showAlert } = useAlert();
  const scrollViewRef = useRef<ScrollView>(null);

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  // State variables
  const [showPostSuccessModal, setShowPostSuccessModal] = useState(false);
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
  const [budget, setBudget] = useState<string | null>("300");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Date/Time mode - simplified state
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [scheduleType, setScheduleType] = useState<"on" | "before">("on");
  const [isFlexible, setIsFlexible] = useState(false);
  const [isExactTime, setIsExactTime] = useState(false);
  const [jobType, setJobType] = useState<"one_day" | "permanent">("one_day");

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

  // Pre-fill form when navigating from Edit Job or Repost Job
  useEffect(() => {
    const editJob = route?.params?.editJob;
    const isEdit = Boolean(route?.params?.isEditMode);

    if (editJob) {
      if (isEdit) {
        setIsEditMode(true);
        setEditingJobId(editJob._id);
        console.log("[PostJob] Entering EDIT mode for job:", editJob._id, editJob.name);
      } else {
        setIsEditMode(false);
        setEditingJobId(null);
        console.log("[PostJob] Prefilling form for reposting job:", editJob.name);
      }

      if (editJob.name) setJobName(editJob.name);
      if (editJob.description) setJobDescription(editJob.description);
      if (editJob.isMultiVacancy !== undefined) {
        setIsMultipleVacancy(editJob.isMultiVacancy);
      }
      if (editJob.participantsNumber) {
        setVacancyCount(editJob.participantsNumber);
      }
      if (editJob.isRemote !== undefined) {
        setCanBeDoneRemotely(editJob.isRemote);
      }
      if (editJob.location) setSelectedLocation(editJob.location);
      if (editJob.address || editJob.location?.address) {
        setTaskAddress(editJob.address || editJob.location?.address);
      }
      if (Array.isArray(editJob.requirements)) {
        setRequirements(editJob.requirements);
      }
      if (Array.isArray(editJob.photos)) {
        setPhotos(editJob.photos);
        setUploadedPhotoUrls(editJob.photos);
      }

      // Job Type & Specific Dates/Budgets
      const isPerm = editJob.jobType === "permanent";
      setJobType(isPerm ? "permanent" : "one_day");

      if (isPerm) {
        if (editJob.startDate) {
          setScheduleDate(new Date(editJob.startDate));
        } else if (editJob.onDate) {
          setScheduleDate(new Date(editJob.onDate));
        }

        if (editJob.monthlySalary) {
          setBudget(String(editJob.monthlySalary));
        } else if (editJob.budget) {
          setBudget(String(editJob.budget));
        }

        if (Array.isArray(editJob.timePreference) && editJob.timePreference.length > 0) {
          setSelectedTimePreferences(editJob.timePreference);
        }

        if (editJob.fromTime && editJob.toTime) {
          setIsExactTime(true);
          const [fH, fM] = editJob.fromTime.split(":");
          let fromH = parseInt(fH, 10);
          const fromAm = fromH >= 12 ? "PM" : "AM";
          fromH = fromH % 12 || 12;
          setFromHour(String(fromH));
          setFromMinute(fM || "00");
          setFromAmPm(fromAm);

          const [tH, tM] = editJob.toTime.split(":");
          let toH = parseInt(tH, 10);
          const toAm = toH >= 12 ? "PM" : "AM";
          toH = toH % 12 || 12;
          setToHour(String(toH));
          setToMinute(tM || "00");
          setToAmPm(toAm);
        } else if (editJob.reportingTime && editJob.reportingTime.includes(":")) {
          setIsExactTime(true);
          const [rH, rM] = editJob.reportingTime.split(":");
          let rHour = parseInt(rH, 10);
          const rAm = rHour >= 12 ? "PM" : "AM";
          rHour = rHour % 12 || 12;
          setFromHour(String(rHour));
          setFromMinute(rM || "00");
          setFromAmPm(rAm);
        } else {
          setIsExactTime(false);
        }
      } else {
        if (editJob.budget) setBudget(String(editJob.budget));

        if (editJob.onDate) {
          setScheduleDate(new Date(editJob.onDate));
        } else if (editJob.beforeDate) {
          setScheduleDate(new Date(editJob.beforeDate));
        }

        if (Array.isArray(editJob.timePreference) && editJob.timePreference.length > 0) {
          setSelectedTimePreferences(editJob.timePreference);
        }

        if (editJob.fromTime && editJob.toTime) {
          setIsExactTime(true);
          const [fH, fM] = editJob.fromTime.split(":");
          let fromH = parseInt(fH, 10);
          const fromAm = fromH >= 12 ? "PM" : "AM";
          fromH = fromH % 12 || 12;
          setFromHour(String(fromH));
          setFromMinute(fM || "00");
          setFromAmPm(fromAm);

          const [tH, tM] = editJob.toTime.split(":");
          let toH = parseInt(tH, 10);
          const toAm = toH >= 12 ? "PM" : "AM";
          toH = toH % 12 || 12;
          setToHour(String(toH));
          setToMinute(tM || "00");
          setToAmPm(toAm);
        } else {
          setIsExactTime(false);
        }
      }

      // Match category
      const catObj = typeof editJob.category === "object" ? editJob.category : null;
      const rawCatId = catObj ? (catObj._id || catObj.id) : editJob.category;
      const catName = catObj?.name || "";

      const allDefs = [...defaultJobCategories, ...defaultPermanentCategories];
      const matchedDefault = allDefs.find(
        (def) =>
          (rawCatId && (def.id === rawCatId || (def as any).backendId === rawCatId)) ||
          (catName && def.name.toLowerCase() === catName.toLowerCase())
      );

      const finalCatId = matchedDefault ? matchedDefault.id : rawCatId;
      if (finalCatId) {
        setSelectedCategory(finalCatId);
        setSelectedValue(matchedDefault ? matchedDefault.name : (catName || ""));
      }
      setCurrentStep(1);
    } else {
      setIsEditMode(false);
      setEditingJobId(null);
    }
  }, [route?.params?.editJob, route?.params?.isEditMode]);
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
        const allDefaults = [...defaultJobCategories, ...defaultPermanentCategories];
        const apiCategories = response.data.data
          .map((category) => {
            console.log("Processing API category:", category);

            // Find matching default category by name (case insensitive)
            const matchingDefault = allDefaults.find(
              (def) => def.name.toLowerCase() === category.name.toLowerCase()
            );

            if (matchingDefault) {
              // Store the mapping: frontend ID -> backend ID, backend ID -> backend ID, and name -> backend ID
              mapping[matchingDefault.id] = category._id;
              mapping[category._id] = category._id;
              mapping[category.name.toLowerCase()] = category._id;
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
              mapping[category.name.toLowerCase()] = category._id;
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
        const identityMapping: Record<string, string> = {};
        allDefaults.forEach((cat) => {
          identityMapping[cat.id] = cat.id;
          identityMapping[cat.name.toLowerCase()] = cat.id;
        });
        setCategoryMapping(identityMapping);
        setJobCategories(defaultJobCategories);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      // Create identity mapping for defaults
      const identityMapping: Record<string, string> = {};
      const allDefaults = [...defaultJobCategories, ...defaultPermanentCategories];
      allDefaults.forEach((cat) => {
        identityMapping[cat.id] = cat.id;
        identityMapping[cat.name.toLowerCase()] = cat.id;
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

    if (jobType === "permanent") {
      const numBudget = parseFloat(budget?.toString() || "0");
      if (isNaN(numBudget) || numBudget < 5000) {
        errors.push("Monthly budget for permanent jobs must be at least ₹5,000");
      }
      if (!scheduleDate) {
        errors.push("Please select a start date for the permanent job");
      }
      if (isExactTime) {
        if (!fromHour || !fromMinute || !fromAmPm) {
          errors.push("Please set the start time for the job");
        }
        if (!toHour || !toMinute || !toAmPm) {
          errors.push("Please set the end time for the job");
        }
        if (fromHour && fromMinute && fromAmPm && toHour && toMinute && toAmPm) {
          const fromTime24 = get24HourTime(fromHour, fromMinute, fromAmPm);
          const toTime24 = get24HourTime(toHour, toMinute, toAmPm);
          if (fromTime24 >= toTime24) {
            errors.push("End time must be after start time");
          }
        }
      } else {
        if (selectedTimePreferences.length === 0) {
          errors.push("Please select a time preference for the permanent job");
        }
      }
    } else {
      // Validate budget/hourly rate
      const rateValidation = validateHourlyRate(budget?.toString() || "");
      if (!rateValidation.status) {
        errors.push(rateValidation.rateError);
      }

      // Validate time fields for non-flexible jobs
      if (!isFlexible) {
        if (!scheduleDate) {
          errors.push("Please select a date for the job");
        }
        if (isExactTime) {
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
      }
    }

    if (errors.length > 0) {
      showAlert({
        type: "info",
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
    const effectiveUserId = user?.id || user?._id;
    if (!effectiveUserId) {
      throw new Error("User information is not available. Please try logging in again.");
    }

    // Get the backend category ID from the mapping
    let backendCategoryId = categoryMapping[selectedCategory];

    // Fallback 1: If selectedCategory is already a 24-char hex Mongo ObjectId
    if (!backendCategoryId && typeof selectedCategory === "string" && /^[0-9a-fA-F]{24}$/.test(selectedCategory)) {
      backendCategoryId = selectedCategory;
    }

    // Fallback 2: Check matching default category by id or name
    if (!backendCategoryId) {
      const allDefs = [...defaultJobCategories, ...defaultPermanentCategories];
      const matched = allDefs.find(
        (c) => c.id === selectedCategory || c.name.toLowerCase() === selectedCategory?.toLowerCase()
      );
      if (matched && categoryMapping[matched.id]) {
        backendCategoryId = categoryMapping[matched.id];
      } else if (matched && typeof (matched as any).backendId === "string") {
        backendCategoryId = (matched as any).backendId;
      } else if (matched && /^[0-9a-fA-F]{24}$/.test(matched.id)) {
        backendCategoryId = matched.id;
      }
    }

    // Fallback 3: If still not resolved but selectedCategory is present
    if (!backendCategoryId && selectedCategory) {
      backendCategoryId = selectedCategory;
    }

    if (!backendCategoryId) {
      console.error("Category mapping not found for:", selectedCategory);
      console.error("Available mappings:", categoryMapping);
      throw new Error("Please select a job category before submitting.");
    }

    console.log("Selected category:", selectedCategory);
    console.log("Backend category ID from mapping:", backendCategoryId);

    const jobData: any = {
      userId: effectiveUserId,
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
      photos: photoUrls.length > 0 ? photoUrls : photos,
      timePreference: selectedTimePreferences, // Send as array
      budget: parseFloat(budget || "300"),
      isOpen: true,
      updatedAt: currentDate,
    };

    if (!isEditMode) {
      jobData.createdAt = currentDate;
    }

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

    // Handle permanent vs one-day date/time
    jobData.jobType = jobType === "permanent" ? "permanent" : "one_day";

    if (jobType === "permanent") {
      const startDateIso = scheduleDate ? scheduleDate.toISOString() : new Date().toISOString();
      jobData.startDate = startDateIso;
      jobData.onDate = startDateIso;
      jobData.monthlySalary = parseFloat(budget || "5000");
      jobData.budget = parseFloat(budget || "5000");
      jobData.timePreference = selectedTimePreferences;

      if (isExactTime) {
        const fromTime24 = get24HourTime(fromHour, fromMinute, fromAmPm);
        const toTime24 = get24HourTime(toHour, toMinute, toAmPm);
        jobData.fromTime = fromTime24;
        jobData.toTime = toTime24;
        jobData.reportingTime = fromTime24;
        jobData.isFlexible = false;
      } else {
        jobData.isFlexible = true;
        jobData.fromTime = undefined;
        jobData.toTime = undefined;
        jobData.reportingTime = selectedTimePreferences.length > 0 ? selectedTimePreferences[0] : undefined;
      }
    } else {
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
    }

    return jobData;
  };

  const resetAllFields = () => {
    // Reset step
    setCurrentStep(1);
    setIsEditMode(false);
    setEditingJobId(null);
    setJobType("one_day");

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
    setIsExactTime(false);
    setFromHour("00");
    setFromMinute("00");
    setFromAmPm("AM");
    setToHour("00");
    setToMinute("00");
    setToAmPm("AM");

    // Reset budget
    setBudget("300");

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

    // Clear navigation edit params
    try {
      (navigation as any).setParams({ editJob: undefined, isEditMode: undefined });
    } catch (e) {}

    console.log("All form fields have been reset");
  };

  // Handle job posting or updating
  const handlePost = async () => {
    if (!validateJobData()) {
      return;
    }

    // Double-check user data is available
    const effectiveUserId = user?.id || user?._id;
    if (!effectiveUserId) {
      showAlert({
        type: "error",
        title: "User Error",
        message:
          "User information is not available. Please try logging in again.",
      });
      return;
    }

    console.log("Selected category before saving:", selectedCategory);
    console.log("Category mapping:", categoryMapping);
    console.log("Backend category ID:", categoryMapping[selectedCategory]);
    setIsSubmitting(true);
    setIsLoading(true);

    try {
      // Create or update job posting
      const jobData = formatJobData();
      console.log(
        "Final job data being sent:",
        JSON.stringify(jobData, null, 2)
      );

      if (isEditMode && editingJobId) {
        const response = await updateJobPosting(editingJobId, jobData);
        if (response.data) {
          Toast.show({
            type: "success",
            text1: "Job Updated",
            text2: "Your job posting has been successfully updated",
          });
          queryClient.invalidateQueries({ queryKey: ["userJobs"] });
          queryClient.invalidateQueries({ queryKey: ["jobs"] });
          queryClient.invalidateQueries({ queryKey: ["jobPosting", editingJobId] });
          resetAllFields();
          navigation.goBack();
        }
      } else {
        const response = await createJobPosting(jobData);
        if (response.data) {
          setShowPostSuccessModal(true);
        }
      }
    } catch (error: any) {
      console.error("Error saving job:", error);
      console.error("Error response data:", error.response?.data);

      let errorMessage = isEditMode
        ? "Failed to update job. Please try again."
        : "Failed to post job. Please try again.";

      // Extract specific error messages from backend response or local errors
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response?.data?.error === "string") {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.errors) {
        if (Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors
            .map((e: any) => (typeof e === "string" ? e : e.message || JSON.stringify(e)))
            .join("\n");
        } else if (typeof error.response.data.errors === "object") {
          const errors = Object.values(error.response.data.errors).flat();
          errorMessage = errors.join("\n");
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage =
          error.response?.data?.error?.message ||
          error.response?.data?.message ||
          "Authentication expired or permission denied. Please log in again.";
      }

      showAlert({
        type: "error",
        title: isEditMode ? "Update Failed" : "Error",
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
        title: "Category Required",
        message: "Please select a job category",
      });
      return;
    }

    if (currentStep === 2) {
      const titleValidation = validateJobTitle(jobName);
      if (!titleValidation.status) {
        showAlert({
          type: "info",
          title: "Job Title Required",
          message: titleValidation.titleError,
        });
        return;
      }

      const descriptionValidation = validateJobDescription(jobDescription);
      if (!descriptionValidation.status) {
        showAlert({
          type: "info",
          title: "Job Description Required",
          message: descriptionValidation.descriptionError,
        });
        return;
      }

      if (!canBeDoneRemotely && !selectedLocation) {
        showAlert({
          type: "info",
          title: "Location Required",
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
          message:
            jobType === "permanent"
              ? "Please select a start date for the permanent job"
              : "Please select a date for your job",
        });
        return;
      }

      // Check if no time preference is selected when Exact Time is OFF
      if (!isExactTime) {
        if (selectedTimePreferences.length === 0) {
          showAlert({
            type: "info",
            title: "Time Preference Required",
            message: "Please select a time preference for your job",
          });
          return;
        }
      }

      // Validate time fields for Exact Time jobs
      if (isExactTime) {
        if (!fromHour || !fromMinute || !fromAmPm) {
          showAlert({
            type: "info",
            title: "Start Time Required",
            message: "Please set the start time for the job",
          });
          return;
        }
        if (!toHour || !toMinute || !toAmPm) {
          showAlert({
            type: "info",
            title: "End Time Required",
            message: "Please set the end time for the job",
          });
          return;
        }

        // Validate that end time is after start time
        const fromTime24 = get24HourTime(fromHour, fromMinute, fromAmPm);
        const toTime24 = get24HourTime(toHour, toMinute, toAmPm);

        if (fromTime24 >= toTime24) {
          showAlert({
            type: "info",
            title: "Invalid Time",
            message: "End time must be after start time",
          });
          return;
        }

        if (!isValidTimeRange(fromHour, fromMinute, fromAmPm)) {
          showAlert({
            type: "info",
            title: "Invalid Time",
            message: "Start time must be between 12 AM and 11:59 PM",
          });
          return;
        }

        if (!isValidTimeRange(toHour, toMinute, toAmPm)) {
          showAlert({
            type: "info",
            title: "Invalid Time",
            message: "End time must be between 12 AM and 11:59 PM",
          });
          return;
        }
      }
    }

    if (currentStep === 4) {
      const rateValidation = validateHourlyRate(budget?.toString() || "");
      if (!rateValidation.status) {
        showAlert({
          type: "info",
          title: "Budget Required",
          message: rateValidation.rateError,
        });
        return;
      }
    }

    setCurrentStep(currentStep + 1);
    // Scroll to top when moving to next step
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Confirm and cleanly exit edit mode without leaving pre-filled fields
  const confirmExitEditMode = useCallback(() => {
    showAlert({
      type: "info",
      title: "Exit Edit Mode?",
      message: "Are you sure you don't want to edit this job? All your changes will be discarded.",
      buttons: [
        {
          text: "Continue Editing",
          style: "cancel",
        },
        {
          text: "Discard & Exit",
          style: "destructive",
          onPress: () => {
            resetAllFields();
            navigation.goBack();
          },
        },
      ],
    });
  }, [navigation, resetAllFields, showAlert]);

  // Navigate to previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Scroll to top when moving to previous step
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      if (isEditMode) {
        confirmExitEditMode();
      } else {
        navigation.goBack();
      }
    }
  };

  // Hardware back button support for Android
  useEffect(() => {
    if (!isEditMode) return;

    const onHardwareBack = () => {
      if (currentStep > 1) {
        setCurrentStep((prev) => prev - 1);
        return true;
      }
      confirmExitEditMode();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onHardwareBack
    );

    return () => subscription.remove();
  }, [isEditMode, currentStep, confirmExitEditMode]);

  // When focusing on the PostJob screen directly without edit params, clear stale edit state
  useFocusEffect(
    useCallback(() => {
      if (!route?.params?.editJob && isEditMode) {
        console.log("[PostJob] Focused fresh without editJob param, resetting form");
        resetAllFields();
      }
    }, [route?.params?.editJob, isEditMode])
  );

  // Increase vacancy count
  const increaseVacancy = useCallback(() => {
    setVacancyCount((prev) => prev + 1);
  }, []);

  // Decrease vacancy count
  const decreaseVacancy = useCallback(() => {
    setVacancyCount((prev) => (prev > 1 ? prev - 1 : 1));
  }, []);

  // Handle picking images from the device's library
  const handlePickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets.map((asset) => asset.uri)]);
      setShowPhotosList(true);
    }
  }, []);

  // Toggle the requirements section
  const toggleRequirementsList = useCallback(() => {
    setShowRequirementsList((prev) => {
      if (!prev && requirements.length === 0) {
        setShowRequirementsModal(true);
        return prev;
      }
      return !prev;
    });
  }, [requirements.length]);

  // Toggle the photos section
  const togglePhotosList = useCallback(() => {
    setShowPhotosList((prev) => {
      if (!prev && photos.length === 0) {
        handlePickImage();
        return prev;
      }
      return !prev;
    });
  }, [photos.length, handlePickImage]);

  // Handle adding a new requirement
  const handleAddRequirement = useCallback(() => {
    if (newRequirement.trim()) {
      setRequirements((prev) => [...prev, newRequirement]);
      setNewRequirement("");
      setShowRequirementsModal(false);
      setShowRequirementsList(true);
    }
  }, [newRequirement]);

  // Remove a requirement at a specific index
  const removeRequirement = useCallback((index) => {
    setRequirements((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      if (updated.length === 0) {
        setShowRequirementsList(false);
      }
      return updated;
    });
  }, []);

  // Remove a photo at a specific index
  const removePhoto = useCallback((index) => {
    setPhotos((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      if (updated.length === 0) {
        setShowPhotosList(false);
      }
      return updated;
    });
  }, []);

  // Open requirements edit modal
  const openEditRequirements = useCallback(() => {
    setEditingRequirements(true);
  }, []);

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

  const getCategoryIcon = useCallback(() => {
    const category = jobCategories.find((cat) => cat.id === selectedCategory);
    return category
      ? category.icon
      : require("../../../assets/placeholder-image.png");
  }, [jobCategories, selectedCategory]);

  const handleCategorySelect = useCallback(
    (categoryId: string, categoryName: string, type?: "one_day" | "permanent") => {
      setSelectedCategory(categoryId);
      setSelectedValue(categoryName);
      if (type) {
        setJobType(type);
        if (type === "permanent") {
          if (!budget || parseFloat(budget) < 5000) {
            setBudget("8000");
          }
        } else {
          if (budget && parseFloat(budget) > 4000) {
            setBudget("300");
          }
        }
      }
    },
    [budget]
  );

  // Render Step 1: Select Category
  const renderStep1 = () => (
    <CategorySelector
      categories={jobCategories}
      selectedCategory={selectedCategory}
      selectedJobType={jobType}
      isEditMode={isEditMode}
      onSelectJobType={(type) => {
        if (isEditMode) return;
        setJobType(type);
        if (type === "permanent") {
          if (!budget || parseFloat(budget) < 5000) {
            setBudget("8000");
          }
        } else {
          if (budget && parseFloat(budget) > 4000) {
            setBudget("300");
          }
        }
      }}
      onSelect={(catId, catName, type) => {
        if (isEditMode) return;
        handleCategorySelect(catId, catName, type);
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
        {jobType === "permanent"
          ? "When should the permanent worker start?"
          : "When does the job need to be done?"}
      </Text>

      {/* Date Picker Input */}
      <TouchableOpacity
        style={styles.selectedCategoryCard}
        onPress={() => setCalendarVisible(true)}
      >
        <View style={styles.premiumCategoryIconContainer}>
          <Ionicons name="calendar-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.categoryTextContainer}>
          <Text style={styles.categoryLabel}>
            {jobType === "permanent" ? "START DATE / JOINING DATE" : "SCHEDULE DATE"}
          </Text>
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

      {/* Date & Time settings - Unified for both One-Day and Permanent jobs */}
      {scheduleDate && (
        <View style={styles.switchCard}>
          <View style={styles.switchHeader}>
            <View style={styles.switchTitleContainer}>
              <View style={styles.switchTitleRow}>
                <Text style={styles.switchLabel}>Set Exact Time</Text>
                <View style={styles.optionalBadge}>
                  <Text style={styles.optionalBadgeText}>Optional</Text>
                </View>
              </View>
              <Text style={styles.switchSubtitle}>
                {jobType === "permanent"
                  ? "Enable this if you want to set specific daily working hours (e.g. 09:00 AM to 05:00 PM). Otherwise, select a general time preference below."
                  : "Enable this only if you need workers to arrive at a sharp scheduled time. Otherwise, select flexible time preferences below."}
              </Text>
            </View>
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
      isPermanent={jobType === "permanent"}
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
        <Text style={styles.headerTitle}>{isEditMode ? "Edit Job" : "Post a Job"}</Text>
        {isEditMode ? (
          <TouchableOpacity onPress={confirmExitEditMode} disabled={isSubmitting} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ color: colors.red, fontSize: 13, fontWeight: "700" }}>Cancel</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
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
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          //bounces={false}
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
            paddingTop: 16,
            //paddingBottom: Platform.OS === "ios" ? 20 : 16,
            backgroundColor: colors.background,
          }}
        >
          {currentStep === 5 ? (
            <CustomButton
              text={isEditMode ? "Update Job" : "Post"}
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

        {/* Peak UI Job Post Confirmation Modal */}
        <JobPostSuccessModal
          visible={showPostSuccessModal}
          jobTitle={jobName}
          isPermanent={jobType === "permanent"}
          onClose={() => {
            setShowPostSuccessModal(false);
            resetAllFields();
            (navigation as any).goBack();
          }}
          onTrackStatus={() => {
            setShowPostSuccessModal(false);
            resetAllFields();
            (navigation as any).navigate("Status");
          }}
          onBackToHome={() => {
            setShowPostSuccessModal(false);
            resetAllFields();
            (navigation as any).navigate("Home");
          }}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default PostJobScreen;
