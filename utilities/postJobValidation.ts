import {
    validateJobTitle,
    validateJobDescription,
    validateHourlyRate,
} from './formValidation';

export interface PostJobValidationErrors {
    category?: string;
    jobName?: string;
    jobDescription?: string;
    location?: string;
    budget?: string;
    timeRange?: string;
    timePreference?: string;
}

export const validateCategoryStep = (selectedCategory: string | null): PostJobValidationErrors => {
    const errors: PostJobValidationErrors = {};

    if (!selectedCategory) {
        errors.category = 'Please select a job category';
    }

    return errors;
};

export const validateDetailsStep = (
    jobName: string,
    jobDescription: string,
    canBeDoneRemotely: boolean,
    selectedLocation: any
): PostJobValidationErrors => {
    const errors: PostJobValidationErrors = {};

    // Validate job title
    const titleValidation = validateJobTitle(jobName);
    if (!titleValidation.status) {
        errors.jobName = titleValidation.titleError;
    }

    // Validate job description
    const descriptionValidation = validateJobDescription(jobDescription);
    if (!descriptionValidation.status) {
        errors.jobDescription = descriptionValidation.descriptionError;
    }

    // Validate location for onsite jobs
    if (!canBeDoneRemotely && !selectedLocation) {
        errors.location = 'Please provide a location for onsite jobs';
    }

    return errors;
};

export const validateDateTimeStep = (
    selectedTimePreferences: string[],
    isExactTime: boolean,
    isFlexible: boolean,
    fromHour: string,
    fromMinute: string,
    fromAmPm: string,
    toHour: string,
    toMinute: string,
    toAmPm: string,
    get24HourTime: (hour: string, minute: string, amPm: string) => string
): PostJobValidationErrors => {
    const errors: PostJobValidationErrors = {};

    // Check if time preference is selected
    if (selectedTimePreferences.length === 0) {
        errors.timePreference = 'Please select a time preference for your job';
    }

    // Validate time fields for Exact Time jobs
    if (isExactTime || !isFlexible) {
        if (!fromHour || !fromMinute || !fromAmPm) {
            errors.timeRange = 'Please set the start time for the job';
            return errors;
        }
        if (!toHour || !toMinute || !toAmPm) {
            errors.timeRange = 'Please set the end time for the job';
            return errors;
        }

        // Validate that end time is after start time
        const fromTime24 = get24HourTime(fromHour, fromMinute, fromAmPm);
        const toTime24 = get24HourTime(toHour, toMinute, toAmPm);

        if (fromTime24 >= toTime24) {
            errors.timeRange = 'End time must be after start time';
        }
    }

    return errors;
};

export const validateBudgetStep = (budget: string | null): PostJobValidationErrors => {
    const errors: PostJobValidationErrors = {};

    // Validate budget/hourly rate
    const rateValidation = validateHourlyRate(budget?.toString() || '');
    if (!rateValidation.status) {
        errors.budget = rateValidation.rateError;
    }

    return errors;
};

export const validateFinalSubmission = (
    selectedCategory: string | null,
    jobName: string,
    jobDescription: string,
    canBeDoneRemotely: boolean,
    selectedLocation: any,
    budget: string | null,
    isFlexible: boolean,
    fromHour: string,
    fromMinute: string,
    fromAmPm: string,
    toHour: string,
    toMinute: string,
    toAmPm: string,
    get24HourTime: (hour: string, minute: string, amPm: string) => string
): { isValid: boolean; errors: string[] } => {
    const allErrors: string[] = [];

    // Category validation
    const categoryErrors = validateCategoryStep(selectedCategory);
    if (categoryErrors.category) allErrors.push(categoryErrors.category);

    // Details validation
    const detailsErrors = validateDetailsStep(jobName, jobDescription, canBeDoneRemotely, selectedLocation);
    if (detailsErrors.jobName) allErrors.push(detailsErrors.jobName);
    if (detailsErrors.jobDescription) allErrors.push(detailsErrors.jobDescription);
    if (detailsErrors.location) allErrors.push(detailsErrors.location);

    // Budget validation
    const budgetErrors = validateBudgetStep(budget);
    if (budgetErrors.budget) allErrors.push(budgetErrors.budget);

    // Time validation for non-flexible jobs
    if (!isFlexible) {
        if (!fromHour || !fromMinute || !fromAmPm) {
            allErrors.push('Please set the start time for the job');
        }
        if (!toHour || !toMinute || !toAmPm) {
            allErrors.push('Please set the end time for the job');
        }

        if (fromHour && fromMinute && fromAmPm && toHour && toMinute && toAmPm) {
            const fromTime24 = get24HourTime(fromHour, fromMinute, fromAmPm);
            const toTime24 = get24HourTime(toHour, toMinute, toAmPm);

            if (fromTime24 >= toTime24) {
                allErrors.push('End time must be after start time');
            }
        }
    }

    return {
        isValid: allErrors.length === 0,
        errors: allErrors
    };
};
