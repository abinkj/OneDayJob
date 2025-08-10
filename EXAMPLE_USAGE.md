# Job Post Types Usage Example

This document shows how to use the new job post types with the fetched data structure.

## Types Created

### JobPost Interface
The main interface that matches the fetched data structure:

```typescript
interface JobPost {
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
```

### JobCardData Interface
A simplified interface for the JobCard component:

```typescript
interface JobCardData {
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
```

## Usage Examples

### 1. Using with JobCard Component

```typescript
import { JobCard } from '../components/jobCard';
import { JobPost, JobCardData } from '../types';

// The fetched data directly matches JobPost interface
const fetchedPosts: JobPost[] = [
  {
    "__v": 0,
    "_id": "689760aa0f4f85947a2545ae",
    "address": "",
    "applicantCount": 0,
    "assignedUsers": [],
    "budget": 200000,
    "category": {
      "_id": "6847141588ab9e76be38facf",
      "name": "Cleaning"
    },
    "createdAt": "2025-08-09T14:52:26.660Z",
    "description": "Just to clean and stuffj khjjjkkk",
    "isCompletedByWorker": false,
    "isFlexible": true,
    "isMultiVacancy": false,
    "isPaymentDone": false,
    "isRemote": false,
    "isVerifiedByEmployer": false,
    "jobStatus": "pending",
    "location": {
      "address": "Munnar , Munnar, Kerala, 685612",
      "city": "Munnar",
      "coordinates": [Object],
      "country": "India",
      "state": "Kerala",
      "zipCode": "685612"
    },
    "name": "Clean my room",
    "participantsNumber": 1,
    "photos": [],
    "requirements": ["Brush"],
    "status": "active",
    "timePreference": ["midday"],
    "updatedAt": "2025-08-09T14:52:26.660Z",
    "userId": {
      "firstName": "Poda77yyhhu",
      "id": "686271a232223e1e8669fca1",
      "lastName": "De77jj",
      "phoneNumber": "+919188767692"
    }
  }
];

// JobCard component accepts JobCardData, which is compatible with JobPost
const renderJobCards = (posts: JobPost[]) => {
  return posts.map((post) => (
    <JobCard 
      key={post._id} 
      data={post} 
      onPress={() => handleJobPress(post._id)} 
    />
  ));
};
```

### 2. Type-Safe Data Handling

```typescript
// Type-safe access to job properties
const processJobPost = (job: JobPost) => {
  const budget = job.budget; // number
  const categoryName = job.category.name; // string
  const isRemote = job.isRemote; // boolean
  
  // Safe location access
  const locationText = job.location.address 
    ? `${job.location.address}, ${job.location.city || ''}, ${job.location.country}`
    : job.location.country || 'Remote';
    
  // Safe requirements handling
  const requirementsText = job.requirements.length > 0
    ? job.requirements.join(', ')
    : 'No specific requirements';
    
  return {
    budget,
    categoryName,
    isRemote,
    locationText,
    requirementsText
  };
};
```

### 3. API Integration

```typescript
import { getJobPostingsByUserId } from '../services/api';

const fetchUserPosts = async (userId: string): Promise<JobPost[]> => {
  try {
    const response = await getJobPostingsByUserId(userId);
    // TypeScript will ensure the returned data matches JobPost[]
    return response.data || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};
```

## Benefits of the New Types

1. **Type Safety**: Prevents runtime errors from accessing undefined properties
2. **IntelliSense**: Better IDE support with autocomplete and property suggestions
3. **Refactoring**: Easier to update code when the API structure changes
4. **Documentation**: Types serve as living documentation of the data structure
5. **Consistency**: Ensures all components use the same data structure

## Migration Notes

- The `JobCard` component now expects `JobCardData` instead of `any`
- Use `post._id` instead of `post.id` for keys in lists
- The `createdAt` field is used instead of `date` for timestamps
- Location formatting now handles the nested structure properly
- Category information is accessed via `post.category.name`
