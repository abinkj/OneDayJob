import { ImageSourcePropType } from "react-native";
export interface UserLocation {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  lastUpdated?: string;
  coordinates?: {
    type?: string;
    coordinates?: number[]; // [longitude, latitude]
  };
}

export interface User {
  // Identifiers
  id?: string; // Derived from _id for convenience across app
  _id?: string; // MongoDB ID from backend

  // Core profile
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string; // Preferred
  phone?: string; // Backward compatibility
  role?: string;
  profilePicture?: string | { uri: string };

  // Location
  // Backend returns an object; we also provide a derived string
  location?: UserLocation;
  locationText?: string;

  // Stats & meta
  rating?: number; // Aggregated rating shown on profile
  averageEmployeeRating?: number | null;
  averageEmployerRating?: number | null;
  completionRate?: number;
  totalJobs?: number;
  totalReviews?: number;
  isVerified?: boolean;
  isActive?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;

  // Preferences from backend
  preferences?: {
    locationBasedSearch?: boolean;
    searchRadius?: number;
  };
}

export interface EditProfileParams {
  user: User;
}

export interface ProfileScreenProps {
  navigation: any;
  route: any;
}

export interface EditProfileScreenProps {
  navigation: any;
  route: {
    params: EditProfileParams;
  };
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerImage: ImageSourcePropType;
  date: string;
  rating: number;
  comment: string;
} 