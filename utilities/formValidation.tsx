import { strings } from "./strings";

// Common regex patterns
const EMAIL_REGEX =
  /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,62}$/;
const NAME_REGEX = /^[A-Za-z\s]+$/;
const PHONE_REGEX = /^[\+]?[\d\s\-\(\)]{10,15}$/;
const ZIP_REGEX = /^\d{5}(-\d{4})?$/; // US zip code format

// Password validation regex patterns
const PASSWORD_PATTERNS = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  specialChar: /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/,
  noSpaces: /^\S*$/,
};

// Constants
const VALIDATION_LIMITS = {
  NAME_MIN: 3,
  NAME_MAX: 30,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 32,
  ZIP_MIN: 5,
} as const;

// Common Types
interface BaseValidationResult {
  status: boolean;
}

interface EmailValidationResult extends BaseValidationResult {
  emailError: string;
}

interface NameValidationResult extends BaseValidationResult {
  nameError: string;
}

interface PhoneValidationResult extends BaseValidationResult {
  phoneError: string;
}

interface PasswordValidationResult extends BaseValidationResult {
  passwordError: string;
}

// Form Types
interface LoginForm {
  email: string;
  password: string;
}

interface LoginValidationResult extends BaseValidationResult {
  emailError: string;
  passwordError: string;
}

interface SignUpForm {
  firstname: string;
  lastname?: string;
  email: string;
  mobile?: string;
  password: string;
  zip?: string;
}

interface SignUpValidationResult extends BaseValidationResult {
  firstnameError: string;
  lastnameError: string;
  emailError: string;
  mobileError: string;
  passwordError: string;
  zipError: string;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordChangeValidationResult extends BaseValidationResult {
  currentPasswordError: string;
  newPasswordError: string;
  confirmPasswordError: string;
}

interface PasswordResetForm {
  newPassword: string;
  confirmPassword: string;
}

interface PasswordResetValidationResult extends BaseValidationResult {
  newPasswordError: string;
  confirmPasswordError: string;
}

// Helper Functions
const isEmpty = (value: string | undefined): boolean => {
  return value === undefined || value.trim() === "";
};

const hasLeadingOrTrailingSpaces = (value: string): boolean => {
  return /^\s/.test(value) || /\s$/.test(value);
};

const containsDoubleSpaces = (value: string): boolean => {
  return value.includes("  ");
};

const isValidLength = (value: string, min: number, max: number): boolean => {
  return value.length >= min && value.length <= max;
};

// Core Validation Functions
export const validateEmail = (email: string): EmailValidationResult => {
  if (isEmpty(email)) {
    return {
      emailError: strings.validations.emailRequired,
      status: false,
    };
  }

  if (hasLeadingOrTrailingSpaces(email)) {
    return {
      emailError: strings.validations.emailSpace,
      status: false,
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      emailError: strings.validations.incorrectEmail,
      status: false,
    };
  }

  return {
    emailError: "",
    status: true,
  };
};

export const validateName = (
  name: string,
  fieldName: "firstname" | "lastname" | "fullname" = "firstname",
  oldName?: string
): NameValidationResult => {
  const errorMessages = {
    firstname: {
      required: strings.validations.firstNameRequired,
      alphabets: strings.validations.nameAlphabetsOnly,
      minChars: strings.validations.minCharsFirstName,
      maxChars: strings.validations.maxCharsFirstName,
    },
    lastname: {
      required: strings.validations.lastNameRequired,
      alphabets: strings.validations.lastNameAlphabetsOnly,
      minChars: strings.validations.minCharsLastName,
      maxChars: strings.validations.maxCharsFirstName,
    },
    fullname: {
      required: strings.validations.nameRequired,
      alphabets: strings.validations.nameAlphabetsOnly1,
      minChars: strings.validations.minCharsFirstName,
      maxChars: strings.validations.maxCharsName,
    },
  };

  const messages = errorMessages[fieldName];
  const minLength = fieldName === "lastname" ? 1 : VALIDATION_LIMITS.NAME_MIN;

  if (isEmpty(name)) {
    return {
      nameError: messages.required,
      status: false,
    };
  }

  if (!NAME_REGEX.test(name) || containsDoubleSpaces(name)) {
    return {
      nameError: messages.alphabets,
      status: false,
    };
  }

  if (!isValidLength(name, minLength, VALIDATION_LIMITS.NAME_MAX)) {
    const errorMessage =
      name.length < minLength ? messages.minChars : messages.maxChars;
    return {
      nameError: errorMessage,
      status: false,
    };
  }

  if (oldName && name === oldName) {
    return {
      nameError: strings.validations.enterNewName,
      status: false,
    };
  }

  return {
    nameError: "",
    status: true,
  };
};

export const validatePhone = (phone: string): PhoneValidationResult => {
  if (isEmpty(phone)) {
    return {
      phoneError: strings.validations.phoneNumberRequired,
      status: false,
    };
  }

  // Check for invalid placeholder number
  if (phone === "000 000 0000" || phone === "0000000000") {
    return {
      phoneError: strings.validations.phoneNumberInvalid,
      status: false,
    };
  }

  // Basic phone number validation
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  if (!PHONE_REGEX.test(phone) || cleanPhone.length < 10) {
    return {
      phoneError: strings.validations.phoneNumberInvalid,
      status: false,
    };
  }

  return {
    phoneError: "",
    status: true,
  };
};

export const validateOtpCode = (
  otp: string
): { otpError: string; status: boolean } => {
  const isValid = /^\d{6}$/.test(otp || "");
  return {
    otpError: isValid ? "" : strings.validations.invalidOtp,
    status: isValid,
  };
};

export const validateZipCode = (
  zip: string
): { zipError: string; status: boolean } => {
  if (isEmpty(zip)) {
    return {
      zipError: strings.validations.zipRequired,
      status: false,
    };
  }

  if (!ZIP_REGEX.test(zip)) {
    return {
      zipError: strings.validations.invalidZipcode,
      status: false,
    };
  }

  return {
    zipError: "",
    status: true,
  };
};

export const validatePassword = (
  password: string,
  requireStrong: boolean = true
): PasswordValidationResult => {
  if (isEmpty(password)) {
    return {
      passwordError: strings.validations.passwordRequired,
      status: false,
    };
  }

  if (!PASSWORD_PATTERNS.noSpaces.test(password)) {
    return {
      passwordError: strings.validations.firstspacePassword,
      status: false,
    };
  }

  if (
    !isValidLength(
      password,
      VALIDATION_LIMITS.PASSWORD_MIN,
      VALIDATION_LIMITS.PASSWORD_MAX
    )
  ) {
    const errorMessage =
      password.length < VALIDATION_LIMITS.PASSWORD_MIN
        ? strings.validations.passwordLength
        : strings.validations.maxPass;
    return {
      passwordError: errorMessage,
      status: false,
    };
  }

  if (requireStrong) {
    const hasUppercase = PASSWORD_PATTERNS.uppercase.test(password);
    const hasLowercase = PASSWORD_PATTERNS.lowercase.test(password);
    const hasNumber = PASSWORD_PATTERNS.number.test(password);
    const hasSpecialChar = PASSWORD_PATTERNS.specialChar.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      return {
        passwordError: strings.validations.passwordLength,
        status: false,
      };
    }
  }

  return {
    passwordError: "",
    status: true,
  };
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): { confirmPasswordError: string; status: boolean } => {
  if (isEmpty(confirmPassword)) {
    return {
      confirmPasswordError: strings.validations.confirmPassRequired,
      status: false,
    };
  }

  if (password !== confirmPassword) {
    return {
      confirmPasswordError: strings.validations.passConfirmNoMatch,
      status: false,
    };
  }

  return {
    confirmPasswordError: "",
    status: true,
  };
};

// Composite Validation Functions
export const loginValidation = ({
  email,
  password,
}: LoginForm): LoginValidationResult => {
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password, false); // Don't require strong validation for login

  return {
    emailError: emailValidation.emailError,
    passwordError: passwordValidation.passwordError,
    status: emailValidation.status && passwordValidation.status,
  };
};

export const signUpValidation = ({
  firstname,
  lastname = "",
  email,
  mobile = "",
  password,
  zip = "",
}: SignUpForm): SignUpValidationResult => {
  const emailValidation = validateEmail(email);
  const firstnameValidation = validateName(firstname, "firstname");
  const lastnameValidation = lastname
    ? validateName(lastname, "lastname")
    : { nameError: "", status: true };
  const mobileValidation = mobile
    ? validatePhone(mobile)
    : { phoneError: "", status: true };
  const passwordValidation = validatePassword(password, true);
  const zipValidation = zip
    ? validateZipCode(zip)
    : { zipError: "", status: true };

  const isValid = [
    emailValidation,
    firstnameValidation,
    lastnameValidation,
    mobileValidation,
    passwordValidation,
    zipValidation,
  ].every((validation) => validation.status);

  return {
    emailError: emailValidation.emailError,
    firstnameError: firstnameValidation.nameError,
    lastnameError: lastnameValidation.nameError,
    mobileError: mobileValidation.phoneError || "",
    passwordError: passwordValidation.passwordError,
    zipError: zipValidation.zipError || "",
    status: isValid,
  };
};

export const resetPasswordValidation = ({
  newPassword,
  confirmPassword,
}: PasswordResetForm): PasswordResetValidationResult => {
  const passwordValidation = validatePassword(newPassword, true);
  const confirmPasswordValidation = validatePasswordMatch(
    newPassword,
    confirmPassword
  );

  return {
    newPasswordError: passwordValidation.passwordError,
    confirmPasswordError: confirmPasswordValidation.confirmPasswordError,
    status: passwordValidation.status && confirmPasswordValidation.status,
  };
};

export const changePasswordValidation = ({
  currentPassword,
  newPassword,
  confirmPassword,
}: PasswordChangeForm): PasswordChangeValidationResult => {
  const currentPasswordValidation = validatePassword(currentPassword, false);
  const newPasswordValidation = validatePassword(newPassword, true);
  const confirmPasswordValidation = validatePasswordMatch(
    newPassword,
    confirmPassword
  );

  // Override error message for current password to use specific message
  const currentPasswordError = isEmpty(currentPassword)
    ? strings.validations.oldPassRequired
    : "";

  return {
    currentPasswordError,
    newPasswordError: newPasswordValidation.passwordError,
    confirmPasswordError: confirmPasswordValidation.confirmPasswordError,
    status:
      !isEmpty(currentPassword) &&
      newPasswordValidation.status &&
      confirmPasswordValidation.status,
  };
};

// Legacy function names for backward compatibility
export const emailValidation = (params: { email: string }) =>
  validateEmail(params.email);
export const MobileNumberValidation = (params: { mobNo: string }) => ({
  mobError: validatePhone(params.mobNo).phoneError,
  status: validatePhone(params.mobNo).status,
});

// Additional utility validations for job-specific fields
export const validateJobTitle = (
  title: string
): { titleError: string; status: boolean } => {
  if (isEmpty(title)) {
    return {
      titleError: "Job title is required.",
      status: false,
    };
  }

  if (!isValidLength(title, 3, 100)) {
    const errorMessage =
      title.length < 3
        ? "Job title must be at least 3 characters long."
        : "Job title cannot exceed 100 characters.";
    return {
      titleError: errorMessage,
      status: false,
    };
  }

  return {
    titleError: "",
    status: true,
  };
};

export const validateJobDescription = (
  description: string
): { descriptionError: string; status: boolean } => {
  if (isEmpty(description)) {
    return {
      descriptionError: "Job description is required.",
      status: false,
    };
  }

  if (!isValidLength(description, 1, 1000)) {
    const errorMessage =
      description.length < 1
        ? "Job description must be at least 10 characters long."
        : "Job description cannot exceed 1000 characters.";
    return {
      descriptionError: errorMessage,
      status: false,
    };
  }

  return {
    descriptionError: "",
    status: true,
  };
};

export const validateHourlyRate = (
  rate: string
): { rateError: string; status: boolean } => {
  if (isEmpty(rate)) {
    return {
      rateError: "Hourly rate is required.",
      status: false,
    };
  }

  const numericRate = parseFloat(rate);
  if (isNaN(numericRate) || numericRate <= 0) {
    return {
      rateError: "Please enter a valid hourly rate.",
      status: false,
    };
  }



  return {
    rateError: "",
    status: true,
  };
};
