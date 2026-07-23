import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile } from "../services/api";
import { storage, normalizeUser, saveUserData } from "../utilities/mmkvStore";
import { User } from "../types";

// Helper to get initial data synchronously from MMKV
const getInitialProfileData = (): User | undefined => {
  try {
    const userString = storage.getString("USER");
    if (userString) {
      return normalizeUser(JSON.parse(userString));
    }
  } catch (e) {
    console.error("Error reading initial user data from MMKV", e);
  }
  return undefined;
};

const getUserIdFromStorage = (): string | undefined => {
  const user = getInitialProfileData();
  return user ? user.id || user._id : undefined;
};

export const useProfile = (initialUserData?: User) => {
  const userId =
    initialUserData?.id || initialUserData?._id || getUserIdFromStorage();

  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const response = await getUserProfile(userId);

      let userData;
      if (response && response.success && response.data) {
        userData = response.data;
      } else {
        userData = response.data || response;
      }

      const normalizedData = normalizeUser(userData);

      // Sync to MMKV on successful fetch
      await saveUserData(normalizedData);

      return normalizedData;
    },
    enabled: !!userId,
    initialData: () => {
      // If initialUserData is provided from Redux, use it
      if (initialUserData) {
        return initialUserData;
      }

      if (!userId) return undefined;
      const initialUser = getInitialProfileData();
      // Only return initial data if it matches the ID we're fetching
      if (
        initialUser &&
        (initialUser.id === userId || initialUser._id === userId)
      ) {
        return initialUser;
      }
      return undefined;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      const response = await updateUserProfile(userId, data);

      if (response && response.success && response.data) {
        return response.data;
      }
      return response.data || response;
    },
    onSuccess: async (updatedData, variables) => {
      const normalizedData = normalizeUser(updatedData);

      // Update TanStack Query Cache
      queryClient.setQueryData(
        ["profile", variables.userId],
        (oldData: any) => {
          return {
            ...oldData,
            ...normalizedData,
          };
        }
      );

      // Update MMKV to keep it in sync
      await saveUserData(normalizedData);
    },
  });
};
