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

// Job Post Types
export interface JobCategory {
  _id: string;
  name: string;
}

export interface JobLocation {
  address: string;
  city?: string;
  coordinates?: {
    type?: string;
    coordinates: number[]; // [longitude, latitude]
  };
  country: string;
  state?: string;
  zipCode?: string;
}

export interface JobUser {
  firstName: string;
  id: string;
  lastName: string;
  phoneNumber: string;
}

export interface JobPost {
  __v: number;
  _id: string;
  address: string;
  applicantCount: number;
  assignedUsers: any[];
  budget: number;
  category: JobCategory;
  createdAt: string;
  description: string;
  isCompletedByWorker: boolean;
  isFlexible: boolean;
  isMultiVacancy: boolean;
  isOpen?: boolean;
  isPaymentDone: boolean;
  isRemote: boolean;
  isVerifiedByEmployer: boolean;
  jobStatus: string;
  location: JobLocation;
  name: string;
  participantsNumber: number;
  photos: string[];
  requirements: string[];
  status: string;
  timePreference: string[];
  updatedAt: string;
  userId: JobUser;
}

// For backward compatibility and convenience
export interface JobCardData {
  _id: string;
  name: string;
  budget: number;
  applicantCount: number;
  location: JobLocation;
  createdAt: string;
  status: string;
  category: JobCategory;
  description: string;
  isRemote: boolean;
  isFlexible: boolean;
  requirements: string[];
  timePreference: string[];
  userId: JobUser;
} 