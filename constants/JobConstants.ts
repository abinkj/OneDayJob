import { ImageSourcePropType } from "react-native";

export interface DefaultCategory {
  id: string;
  name: string;
  icon: ImageSourcePropType;
}

export interface TimeSlot {
  id: string;
  name: string;
  time: string;
  true: ImageSourcePropType;
  false: ImageSourcePropType;
}

// Default Job Categories (fallback if API fails)
export const defaultJobCategories: DefaultCategory[] = [
  {
    id: "cleaning",
    name: "Cleaning",
    icon: require("../assets/images/cleaning.png"),
  },
  {
    id: "assembly",
    name: "Assembly",
    icon: require("../assets/images/assembly.png"),
  },
  {
    id: "repair",
    name: "Repair",
    icon: require("../assets/images/repair.png"),
  },
  {
    id: "delivery",
    name: "Delivery",
    icon: require("../assets/images/delivery.png"),
  },
  {
    id: "yardwork",
    name: "Yard Work",
    icon: require("../assets/images/yardwork.png"),
  },
  {
    id: "hauling",
    name: "Hauling",
    icon: require("../assets/images/hauling.png"),
  },
  {
    id: "catering",
    name: "Catering",
    icon: require("../assets/images/catering.png"),
  },
  {
    id: "painting",
    name: "Painting",
    icon: require("../assets/images/paint.png"),
  },
  {
    id: "computer",
    name: "Computer Fixing",
    icon: require("../assets/images/computer.png"),
  },
  {
    id: "plumber",
    name: "Plumber",
    icon: require("../assets/images/plumber.png"),
  },
  {
    id: "electrician",
    name: "Electrician",
    icon: require("../assets/images/electrician.png"),
  },
  {
    id: "custom",
    name: "Custom",
    icon: require("../assets/images/custom.png"),
  },
];

// Time Slot Data
export const timeSlots: TimeSlot[] = [
  {
    id: "morning",
    name: "Morning",
    time: "Before 10AM",
    true: require("../assets/images/morning.png"),
    false: require("../assets/images/morningU.png"),
  },
  {
    id: "midday",
    name: "Midday",
    time: "10AM - 2PM",
    true: require("../assets/images/midday.png"),
    false: require("../assets/images/middayU.png"),
  },
  {
    id: "afternoon",
    name: "Afternoon",
    time: "2PM - 6PM",
    true: require("../assets/images/afternoon.png"),
    false: require("../assets/images/afternoonU.png"),
  },
  {
    id: "evening",
    name: "Evening",
    time: "After 6PM",
    true: require("../assets/images/evening.png"),
    false: require("../assets/images/eveningU.png"),
  },
];

// Helper function to get category icon by name
export const getCategoryIcon = (categoryName?: string): ImageSourcePropType => {
  if (!categoryName) return require("../assets/images/custom.png");

  const category = defaultJobCategories.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  );

  return category ? category.icon : require("../assets/images/custom.png");
};
