import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getJobPostings,
  getJobPostingsByUserId,
  getAppliedJobsByUserId,
  deleteJobPosting,
  withdrawApplication,
} from "../services/api";
import { JobPost } from "../types";

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
  return useInfiniteQuery({
    queryKey: ["jobs", filters],
    queryFn: async ({ pageParam = 1, signal }) => {
      const response = await getJobPostings({
        ...filters,
        page: pageParam,
        limit: 20
      }, signal);

      // Handle different response structures
      let jobs: JobPost[] = [];
      let hasMore = false;

      if (response.data?.data) {
        jobs = Array.isArray(response.data.data) ? response.data.data : [];
        hasMore = response.data.pagination?.hasMore || false;
      } else if (response.data?.jobs) {
        jobs = Array.isArray(response.data.jobs) ? response.data.jobs : [];
        hasMore = response.data.pagination?.hasMore || false;
      } else if (Array.isArray(response.data)) {
        jobs = response.data;
        hasMore = false;
      }

      return {
        jobs,
        page: pageParam,
        hasMore
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error: any) => {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useUserJobPostings = (userId: string | undefined) => {
  return useInfiniteQuery({
    queryKey: ["userJobs", userId],
    queryFn: async ({ pageParam = 1, signal }) => {
      if (!userId) return { data: [], hasMore: false };
      const response = await getJobPostingsByUserId(userId, pageParam, 10, signal);
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error: any) => {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useUserAppliedJobs = (userId: string | undefined) => {
  return useInfiniteQuery({
    queryKey: ["userAppliedJobs", userId],
    queryFn: async ({ pageParam = 1, signal }) => {
      if (!userId) return { data: [], hasMore: false };
      const response = await getAppliedJobsByUserId(userId, pageParam, 10, signal);
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error: any) => {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => deleteJobPosting(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userJobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
};

export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => withdrawApplication(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAppliedJobs"] });
    },
  });
};

