import { Colors } from '../constants/Colors';

export interface StatusInfo {
  label: string;
  color: string;
  backgroundColor: string;
  icon: string;
  description: string;
}

// Job statuses for My Posts (employer view)
export const JOB_STATUSES = {
  DRAFT: 'draft',
  POSTED: 'posted', 
  FILLED: 'filled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

// Application statuses for Applied section (employee view)
export const APPLICATION_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted', 
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
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
    case APPLICATION_STATUSES.PENDING:
      return {
        label: 'Pending',
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
    
    case APPLICATION_STATUSES.IN_PROGRESS:
      return {
        label: 'In Progress',
        color: '#2196F3',
        backgroundColor: '#2196F320',
        icon: 'play-circle-outline',
        description: 'Work is in progress'
      };
    
    case APPLICATION_STATUSES.COMPLETED:
      return {
        label: 'Completed',
        color: '#4CAF50',
        backgroundColor: '#4CAF5020',
        icon: 'checkmark-done-outline',
        description: 'Work completed successfully'
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
    return applicationStatus;
  }
  
  return jobStatus;
};
