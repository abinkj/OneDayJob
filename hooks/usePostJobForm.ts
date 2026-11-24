import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { LocationData } from "../services/locationService";

export interface PostJobFormData {
  // Category
  selectedCategory: string | null;

  // Job Details
  jobName: string;
  jobDescription: string;
  isMultipleVacancy: boolean;
  vacancyCount: number;
  canBeDoneRemotely: boolean;

  // Location
  taskAddress: string;
  selectedLocation: LocationData | null;

  // Date & Time
  dateMode: "flexible" | "onDate" | "beforeDate";
  onDate: string | null;
  beforeDate: string | null;
  isFlexible: boolean;
  selectedTimePreferences: string[];
  isExactTime: boolean;
  fromHour: string;
  fromMinute: string;
  fromAmPm: "AM" | "PM";
  toHour: string;
  toMinute: string;
  toAmPm: "AM" | "PM";

  // Budget & Requirements
  budget: string | null;
  requirements: string[];
  photos: any[];
  uploadedPhotoUrls: string[];
}

const defaultValues: PostJobFormData = {
  selectedCategory: null,
  jobName: "",
  jobDescription: "",
  isMultipleVacancy: false,
  vacancyCount: 1,
  canBeDoneRemotely: false,
  taskAddress: "",
  selectedLocation: null,
  dateMode: "flexible",
  onDate: null,
  beforeDate: null,
  isFlexible: true,
  selectedTimePreferences: [],
  isExactTime: false,
  fromHour: "09",
  fromMinute: "00",
  fromAmPm: "AM",
  toHour: "05",
  toMinute: "00",
  toAmPm: "PM",
  budget: null,
  requirements: [],
  photos: [],
  uploadedPhotoUrls: [],
};

export const usePostJobForm = () => {
  const { control, watch, setValue, getValues, reset } =
    useForm<PostJobFormData>({
      defaultValues,
      mode: "onChange",
    });

  // Watch all form values for easy access
  const formData = watch();

  // Helper function to update any field
  const updateField = <K extends keyof PostJobFormData>(
    field: K,
    value: PostJobFormData[K]
  ) => {
    setValue(field, value);
  };

  // Reset form to initial state
  const resetForm = () => {
    reset(defaultValues);
  };

  // Get current form data
  const getCurrentData = () => getValues();

  return {
    control,
    formData,
    updateField,
    resetForm,
    getCurrentData,
    setValue,
    getValues,
  };
};
