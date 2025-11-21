import { Colors } from '../constants/Colors';

export interface StatusInfo {
  label: string;
  color: string;
  backgroundColor: string;
  icon: string;
  description: string;
}

// Job statuses for My Posts (employer view) - aligned with backend
export const JOB_STATUSES = {
  DRAFT: 'draft',
  POSTED: 'posted',
  FILLED: 'filled',
  IN_PROGRESS: 'in_progress',
  WORK_COMPLETED: 'work_completed', // Work done by employees, payment pending
  COMPLETED: 'completed', // Payment completed
  CANCELLED: 'cancelled'
} as const;

// Application statuses for Applied section (employee view) - aligned with backend
export const APPLICATION_STATUSES = {
  APPLIED: 'applied',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
} as const;

export const getJobStatusInfo = (status: string): StatusInfo => {
  const normalizedStatus = status?.toLowerCase() || '';

  switch (normalizedStatus) {
    case JOB_STATUSES.DRAFT:
      return {
        label: 'Draft',
        color: Colors.subGrey,
        backgroundColor: '#F5F5F5',
        icon: 'document-outline',
        description: 'Job is being prepared'
      };

    case JOB_STATUSES.POSTED:
      return {
        label: 'Open',
        color: Colors.blue,
        backgroundColor: Colors.blue + '20',
        icon: 'eye-outline',
        description: 'Accepting applications'
      };


    case JOB_STATUSES.FILLED:
      return {
        label: 'Filled',
        color: '#28a745',
        backgroundColor: '#28a74520',
        icon: 'checkmark-circle-outline',
        description: 'All positions filled'
      };

    case JOB_STATUSES.IN_PROGRESS:
      return {
        label: 'In Progress',
        color: '#FF9800',
        backgroundColor: '#FF980020',
        icon: 'play-circle-outline',
        description: 'Work has started'
      };

    case JOB_STATUSES.WORK_COMPLETED:
      return {
        label: 'Work Completed',
        color: '#4CAF50',
        backgroundColor: '#4CAF5020',
        icon: 'checkmark-circle-outline',
        description: 'Work finished, payment pending'
      };

    case JOB_STATUSES.COMPLETED:
      return {
        label: 'Completed',
        color: '#4CAF50',
        backgroundColor: '#4CAF5020',
        icon: 'checkmark-done-outline',
        description: 'Work finished successfully'
      };

    case JOB_STATUSES.CANCELLED:
      return {
        label: 'Cancelled',
        color: Colors.red,
        backgroundColor: Colors.red + '20',
        icon: 'close-circle-outline',
        description: 'Job was cancelled'
      };

    default:
      return {
        label: status || 'Unknown',
        color: Colors.subGrey,
        backgroundColor: '#F5F5F5',
        icon: 'help-circle-outline',
        description: 'Status unknown'
      };
  }
};

export const getApplicationStatusInfo = (status: string): StatusInfo => {
  const normalizedStatus = status?.toLowerCase() || '';

  switch (normalizedStatus) {
    case APPLICATION_STATUSES.APPLIED:
      return {
        label: 'Applied',
        color: '#FF9800',
        backgroundColor: '#FF980020',
        icon: 'time-outline',
        description: 'Waiting for employer response'
      };

    case APPLICATION_STATUSES.ACCEPTED:
      return {
        label: 'Accepted',
        color: '#28a745',
        backgroundColor: '#28a74520',
        icon: 'checkmark-circle-outline',
        description: 'Your application was accepted'
      };

    case APPLICATION_STATUSES.REJECTED:
      return {
        label: 'Rejected',
        color: Colors.red,
        backgroundColor: Colors.red + '20',
        icon: 'close-circle-outline',
        description: 'Application was not selected'
      };

    case APPLICATION_STATUSES.WITHDRAWN:
      return {
        label: 'Withdrawn',
        color: Colors.subGrey,
        backgroundColor: '#F5F5F5',
        icon: 'arrow-undo-outline',
        description: 'You withdrew your application'
      };


    default:
      // Try to get info from job statuses (for when we show job status instead of application status)
      return getJobStatusInfo(status);
  }
};

// Helper function to determine if a job is active (can receive applications)
export const isJobActive = (status: string): boolean => {
  const normalizedStatus = status?.toLowerCase() || '';
  return normalizedStatus === JOB_STATUSES.POSTED;
};

// Helper function to determine if an application is active (not withdrawn/rejected)
export const isApplicationActive = (status: string): boolean => {
  const normalizedStatus = status?.toLowerCase() || '';
  return !['withdrawn', 'rejected'].includes(normalizedStatus);
};

// Helper function to get the appropriate status for display
export const getDisplayStatus = (jobStatus: string, applicationStatus?: string, isEmployer: boolean = false): string => {
  if (isEmployer) {
    return jobStatus;
  }

  // For employees, show application status if available, otherwise job status
  if (applicationStatus) {
    // If accepted, check if job has progressed beyond "posted" or "filled"
    // We want to show "In Progress", "Work Completed", etc. instead of just "Accepted"
    if (applicationStatus.toLowerCase() === 'accepted') {
      const normalizedJobStatus = jobStatus?.toLowerCase() || '';
      if (['in_progress', 'work_completed', 'completed'].includes(normalizedJobStatus)) {
        return jobStatus;
      }
    }
    return applicationStatus;
  }

  return jobStatus;
};

// Helper function to determine if work is completed based on status and flags
export const isWorkCompleted = (jobStatus: string, isCompletedByWorker?: boolean, isVerifiedByEmployer?: boolean): boolean => {
  const normalizedStatus = jobStatus?.toLowerCase() || '';

  // Check if status indicates work completion
  if (normalizedStatus === 'completed' || normalizedStatus === 'work_completed') {
    return true;
  }

  // Check backend flags
  if (isCompletedByWorker === true || isVerifiedByEmployer === true) {
    return true;
  }

  return false;
};

// Helper function to get the correct display status for employer view
// Maps backend "completed" to "work_completed" when payment is not done
export const getEmployerDisplayStatus = (jobStatus: string, isPaymentDone?: boolean): string => {
  const normalizedStatus = jobStatus?.toLowerCase() || '';

  // If backend says completed but payment is not done, show as work_completed
  if (normalizedStatus === 'completed' && isPaymentDone !== true) {
    return 'work_completed';
  }

  return jobStatus;
};
