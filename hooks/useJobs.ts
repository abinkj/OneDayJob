import { useQuery } from '@tanstack/react-query';
import { getJobPostings, getJobsByLocation } from '../services/api';
import { JobPost } from '../types';

interface JobFilters {
  category?: string | null;
  priceSort?: string | null;
  distance?: string | null;
  search?: string;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export const useJobPostings = (filters: JobFilters) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const response = await getJobPostings(filters);
      
      // Handle different response structures based on existing api.tsx logic
      let jobs: JobPost[] = [];
      if (response.data?.data) {
        jobs = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response.data?.jobs) {
        jobs = Array.isArray(response.data.jobs) ? response.data.jobs : [];
      } else if (Array.isArray(response.data)) {
        jobs = response.data;
      }
      
      return jobs;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
