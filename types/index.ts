export interface User {
  _id?: string; // MongoDB ID
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePicture?: string | { uri: string };
  location?: string;
  bio?: string;
  rating?: number;
  completionRate?: number;
  totalJobs?: number;
  totalReviews?: number;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  lastLogin?: string | null;
  phoneNumber?: string;
  role?: string;
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
  reviewerImage: string;
  date: string;
  rating: number;
  comment: string;
} 