export const strings = {
  APP_NAME: "One Day Job",
  APP_VERSION: "Version 1.0",
  APP_DESCRIPTION: "A platform to find and post one-day job listings.",
  APP_COPYRIGHT: "© 2024 One Day Job. All rights reserved.",
  APP_SUPPORT_EMAIL: "support@onedayjob.com",
  APP_PRIVACY_POLICY: "https://www.zoopol.com/privacy-policy",
  APP_TERMS_CONDITIONS: "https://www.zoopol.com/terms",

  validations: {
    // Signup
    firstNameRequired: "First name is required.",
    lastNameRequired: "Last name is required.",
    nameRequired: "Please enter your full name.",
    nameRequireds: "Name is required.",
    zipRequired: "Zip code is required.",
    invalidZipcode: "Invalid zip code.",
    nameAlphabetsOnly:
      "First name field allows alphabets and single spaces only.",
    lastNameAlphabetsOnly:
      "Last name field allows alphabets and single spaces only.",
    nameAlphabetsOnly1: "Name allows alphabets and single spaces only.",
    minCharsFirstName: "First name must have at least 3 characters.",
    minCharsLastName: "Last name must have at least 1 character.",
    maxCharsFirstName:
      "Exceeded maximum character limit for first name. Maximum allowed character length is 30.",
    maxCharsName:
      "Exceeded maximum character limit for name. Maximum allowed character length is 30.",

    emailRequired: "Please enter your email address.",
    incorrectEmail: "Please enter a valid email address.",
    emailSpace: "No spaces allowed.",
    passRequired: "Please enter your password.",
    maxPass:
      "Exceeded maximum character limit for password. Maximum allowed character length is 32.",
    passwordLength:
      "Please create a password with at least 8 characters, including one uppercase letter, one lowercase letter, and one number.",
    enterNewName: "New name cannot be the same as old name.",

    // Change/Reset password
    currentPassRequired: "Current password is required.",
    oldPassRequired: "Old password is required.",
    confirmPassRequired: "Confirm password is required.",
    currPassRequired: "Current password is required.",
    currPassMustHave:
      "Please provide a password with at least 8 characters, including one uppercase letter, one lowercase letter, one special character, and one number.",
    newPassRequired: "New password is required.",
    newPassMustHave:
      "Please create a password with at least 8 characters, including one uppercase letter, one lowercase letter, one special character, and one number.",
    passConfirmNoMatch: "Confirm password and new password do not match.",
    passwordMismatch: "Confirm password and password do not match.",

    // Login
    passwordRequired: "Please enter your password.",
    incorrectPassword: "Incorrect password.",
    firstspacePassword: "Password must not contain any spaces.",
    maxPassword: "Password must be at most 20 characters.",
    passwordCharacters:
      "Password must contain at least 1 number, 1 special character, and 1 uppercase letter.",
    invalidOtp: "Invalid OTP! Please try again.",

    phoneNumberRequired: "Please enter your mobile number.",
    phoneNumberInvalid: "Please enter a valid mobile number.",
  },

  common: {
    continue: "Continue",
    cancel: "Cancel",
    email: "Email",
    submit: "Submit",
    emailAdd: "Email Address",
    oldPassword: "Old Password",
    enterOldPassword: "Enter your old password",
    password: "Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    back: "Back",
    name: "Name",
    number: "Mobile Number",
    yes: "Yes",
    no: "No",
    delete: "Delete",
    logout: "Logout",
    skip: "Skip",
    terms: "Terms and Conditions",
    privacy: "Privacy Policy",
    save: "Save",
    add: "Add",
    update: "Update",
    del: "Yes, Delete",
    okay: "Okay",
    updateNow: "Update Now",
    upload: "Upload",
    success: "Success",
  },

  placeholder: {
    fullname: "Enter your name",
    firstname: "Enter your first name",
    lastname: "Enter your last name",
    zip: "Enter your zip code",
    email: "Enter your email",
    password: "Enter your password",
    confirmPassword: "Confirm your password",
    currentPass: "Enter your current password",
    newPass: "Enter your new password",
    confirmPass: "Confirm password",
    name: "Name",
    age: "Age",
    gender: "Gender",
    location: "Location",
    number: "Enter your mobile number",
    searchUser: "Search people...",
    searchCategory: "Search category...",
    searchJobs: "Search jobs...",
    category: "Enter the category",
    jobTitle: "Enter job title",
    jobDescription: "Describe the job",
    hourlyRate: "Hourly rate ($)",
    jobDate: "Select job date",

    // Profile completion for service providers
    social: "Enter your social security number",
    address: "Enter your address",
    bio: "Tell us about yourself",
    price: "Enter your hourly rate",
    skills: "List your skills",
    experience: "Years of experience",
  },

  permission: {
    noPermissionCamera: "Camera permission not granted.",
    noPermissionCameraDesc:
      "One Day Job needs access to your camera to take pictures. If disabled, you cannot use the camera.",
    noPermissionGallery: "Storage permission not granted.",
    noPermissionGalleryDesc:
      "One Day Job needs access to your storage to open gallery. If disabled, you cannot use the gallery.",
    noPermissionDoc: "Storage permission not granted.",
    noPermissionDocDesc:
      "One Day Job needs access to your storage. If disabled, you cannot use the gallery.",
    noPermissionLocation: "Location permission not granted.",
    noPermissionLocationDesc:
      "One Day Job needs access to your location to show nearby jobs. If disabled, location-based features will not work.",

    allow: "Enable",
    cancel: "Cancel",
    camera: "Camera",
    gallery: "Gallery",
    location: "Location",
    ok: "OK",
  },

  empty: {
    noNetwork: "No Internet Connection",
    noNetworkDesc:
      "You are not connected to the internet. Make sure Wi-Fi is on, Airplane Mode is off, and try again.",
    noNotification: "No Notifications Yet!",
    noNotificationSub:
      "You don't have any notifications right now. We will notify you about new updates.",
    nothingSearch: "Nothing Yet to Search",
    nothingSearchDesc:
      "Your search history is currently empty. Start exploring by entering a keyword or phrase in the search bar above.",
    noJobs: "No Jobs Found",
    noJobsDesc:
      "There are no jobs matching your criteria. Try adjusting your filters or search terms.",
    noApplications: "No Applications Yet",
    noApplicationsDesc:
      "You haven't applied to any jobs yet. Start browsing available opportunities.",
    oops: "Oops!",
    noData: "No data found",
    backToHome: "Back to Home",
  },

  alert: {
    areYouSure: "Are you sure?",
    logout: "Are you sure you want to log out?",
    logoutSub:
      "You can log back into your account. Are you sure you want to logout?",
    deleteAccSub: "Are you sure you want to delete your account?",
    deleteAcc: "Delete Account",
    deleteAccBtn: "Yes, Delete",
    terminatedAcc: "Account Deleted",
    terminatedAccSub:
      "Your account has been deleted. You no longer have access to your data or services. Please reach out to support if you need assistance.",
    inActiveTitle: "Oops!",
    inActiveSub:
      "It seems your account is inactive. Contact support for more details.",
    inActiveAcc: "Inactive Account!",
    inActiveAccSub:
      "It seems your account is inactive. Contact support for more details.",
    cancelJob: "Cancel Job",
    cancelJobSub: "Are you sure you want to cancel this job posting?",
    completeJob: "Mark as Complete",
    completeJobSub: "Are you sure this job has been completed?",
  },

  error: {
    default: "Something went wrong. Please try again later.",
    apiError:
      "Something went wrong. Please check your network connection or try again later.",
    jobNotFound: "Job not found or has been removed.",
    applicationFailed: "Failed to submit application. Please try again.",
    uploadFailed: "File upload failed. Please try again.",
  },

  onboarding: {
    slides: [
      {
        id: "1",
        title: "Find work. Hire help. Instantly.",
      },
      {
        id: "2",
        title: "Hire trusted help in minutes.",
      },
      {
        id: "3",
        title: "Find local gigs. Earn daily.",
      },
      {
        id: "4",
        title: "Ready to make it happen?",
      },
    ],
    buttons: {
      skip: "Skip",
      next: "Next",
      getStarted: "Get started",
    },
    signin: {
      title: "Let's Sign You In",
      desc1: "Welcome back,",
      desc2: "We missed you!",
      error: "Sign-In Error",
    },
    signup: {
      title: "Let's Get Started",
      desc1: "Welcome!",
      desc2: "Let's get you started",
      error: "Sign-Up Error",
    },
    forgotpassword: {
      title: "Forgot Password?",
      desc1: "Don't worry! It happens.",
      desc2: "Please enter your email address.",
      submit: "Submit",
      error: "Email Error",
    },
    signUp: "Sign Up",
    signIn: "Sign In",
    login: "Login",
    forgotPassword: "Forgot Password?",
    chooseUserType: "I want to:",
    findJobs: "Find Jobs",
    postJobs: "Post Jobs",
  },

  auth: {
    login: {
      title: "Welcome back",
      subtitle: "Enter your mobile number to sign in.",
      labelPhone: "Phone number",
      placeholderPhone: "98765 43210",
      sendCode: "Send code",
      footerText: "New to Zoopol?",
      createAccountAction: "Create an account",
      validationTitle: "Invalid number",
      errorTitle: "Unable to send code",
      errorMessage:
        "We ran into an issue sending the verification code. Please check your connection and try again.",
    },
    signup: {
      title: "Join Zoopol",
      subtitle: "Start finding local gigs and hiring help today.",
      placeholderName: "Alex Rivera",
      placeholderPhone: "98765 43210",
      labelName: "Full name",
      labelPhone: "Phone number",
      sendCode: "Send code",
      haveAccountCta: "Already have an account?",
      loginAction: "Sign in",
      invalidNameTitle: "Invalid name",
      invalidNumberTitle: "Invalid number",
      errorTitle: "Unable to send code",
      errorMessage:
        "We ran into an issue sending the verification code. Please check your connection and try again.",
    },
    otp: {
      title: "Verify your phone",
      subtitle: "We sent a 6-digit code to",
      placeholder: "------",
      confirm: "Confirm",
      verifying: "Verifying...",
      resendPrompt: "Didn't get the code? ",
      resend: "Resend",
      resending: "Sending...",
      success: "Verified!",
      settingUp: "Setting up your experience...",
      setupFailedTitle: "Setup incomplete",
      setupFailedMessage:
        "We couldn't set up your account right now. Please try again in a moment.",
      resendSuccessTitle: "Code sent",
      resendSuccessMessage:
        "A new verification code is on its way to your phone.",
      resendErrorTitle: "Couldn't send code",
      verificationFailedTitle: "Verification failed",
      defaultVerificationError: "Invalid code. Please check and try again.",
    },
    profileCompletion: {
      title: "Tell us about yourself",
      subtitle:
        "Introduce yourself to the Zoopol community. A photo is optional.",
      labelFirstName: "First name",
      placeholderFirstName: "e.g., Alex",
      labelLastName: "Last name",
      placeholderLastName: "e.g., Rivera",
      continue: "Continue",
      choosePhoto: "Choose a profile photo",
      uploadingTitle: "Uploading photo...",
      uploadingSub: "Just a second...",
    },
    suspended: {
      headerTitle: "Account status",
      title: "Your account is suspended",
      subtitle:
        "We suspended your account because activities on it violated our community guidelines and safety policies.",
      infoBox:
        "To keep our community safe, access to gigs, matching, and messaging is restricted.",
      contactSupport: "Contact Support",
      signOut: "Sign out",
      footerTeam: "Zoopol Trust & Safety Team",
    },
  },

  profile: {
    profile: "Profile",
    editProfile: "Edit Profile",
    profileDesc: "Your profile is currently empty.",
    myApplications: "My Applications",
    myJobs: "My Job Postings",
    earnings: "Earnings",
    reviews: "Reviews",
    settings: "Settings",
    dummyName: "John Smith",
    dummyJoined: "Joined Jan 10, 2024",
    save: "Save",
    viewProfile: "View Profile",
    completeProfile: "Complete Profile",
  },

  jobs: {
    jobDetails: "Job Details",
    applyNow: "Apply Now",
    applied: "Applied",
    postJob: "Post a Job",
    myJobs: "My Jobs",
    nearbyJobs: "Nearby Jobs",
    recentJobs: "Recent Jobs",
    featuredJobs: "Featured Jobs",
    searchJobs: "Search Jobs",
    filterJobs: "Filter Jobs",
    jobTitle: "Job Title",
    jobDescription: "Job Description",
    jobCategory: "Category",
    jobDate: "Date",
    jobTime: "Time",
    jobLocation: "Location",
    hourlyRate: "Hourly Rate",
    estimatedDuration: "Estimated Duration",
    requirements: "Requirements",
    contactInfo: "Contact Information",
    jobPosted: "Job posted successfully!",
    applicationSent: "Application sent successfully!",
    noJobsAvailable: "No jobs available at the moment.",
    jobExpired: "This job posting has expired.",
    viewApplications: "View Applications",
    applicants: "Applicants",
    hireApplicant: "Hire",
    markComplete: "Mark Complete",
    jobCompleted: "Job Completed",
    paymentPending: "Payment Pending",
    rateExperience: "Rate Your Experience",
  },

  home: {
    greeting: "Hello,",
    userName: "John Smith",
    welcomeMessage: "Find your perfect one-day job",
    quickActions: "Quick Actions",
    browseJobs: "Browse Jobs",
    postJob: "Post a Job",
    myApplications: "My Applications",
    nearbyJobs: "Jobs Near You",
    popularCategories: "Popular Categories",
    recentActivity: "Recent Activity",
  },

  categories: {
    all: "All Categories",
    cleaning: "Cleaning",
    delivery: "Delivery",
    moving: "Moving & Hauling",
    handyman: "Handyman",
    gardening: "Gardening",
    petCare: "Pet Care",
    babysitting: "Babysitting",
    tutoring: "Tutoring",
    photography: "Photography",
    eventStaff: "Event Staff",
    cooking: "Cooking",
    administrative: "Administrative",
    other: "Other",
  },

  notifications: {
    newJobAlert: "New job posted in your area",
    applicationUpdate: "Application status updated",
    jobReminder: "Job reminder",
    paymentReceived: "Payment received",
    messageReceived: "New message received",
    jobCompleted: "Job marked as completed",
    reviewReceived: "New review received",
  },
};

export default strings;
