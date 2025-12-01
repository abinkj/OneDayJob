import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getJobPostings, 
  getJobPostingsByUserId, 
  getAppliedJobsByUserId, 
  deleteJobPosting, 
  withdrawApplication 
} from '../services/api';
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

export const useUserJobPostings = (userId: string | undefined) => {
  return useInfiniteQuery({
    queryKey: ['userJobs', userId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!userId) return { data: [], hasMore: false };
      const response = await getJobPostingsByUserId(userId, pageParam, 10);
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    enabled: !!userId,
  });
};

export const useUserAppliedJobs = (userId: string | undefined) => {
  return useInfiniteQuery({
    queryKey: ['userAppliedJobs', userId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!userId) return { data: [], hasMore: false };
      const response = await getAppliedJobsByUserId(userId, pageParam, 10);
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    enabled: !!userId,
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => deleteJobPosting(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userJobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => withdrawApplication(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAppliedJobs'] });
    },
  });
};
