import api from "../api";

// ── DigiLocker Flow Types ────────────────────────────────────────────────────

export interface DigiLockerInitiateResponse {
  success: boolean;
  data: {
    verificationId: string;
    digilockerUrl: string;
    redirectUrl: string;
    isSimulated?: boolean;
  };
}

export interface DigiLockerResultResponse {
  success: boolean;
  message: string;
  data: {
    status: string;
    isVerified: boolean;
    aadhaarDetails?: {
      maskedAadhaar: string;
      name?: string;
      dob?: string;
      gender?: string;
      verifiedAt: string;
    };
  };
}

// ── Legacy OTP Flow Types ────────────────────────────────────────────────────

export interface SendAadhaarOtpResponse {
  success: boolean;
  message: string;
  data: {
    refId: string;
    isSimulated?: boolean;
  };
}

export interface VerifyAadhaarOtpResponse {
  success: boolean;
  message: string;
  data: {
    isVerified: boolean;
    aadhaarDetails: {
      maskedAadhaar: string;
      name?: string;
      dob?: string;
      gender?: string;
      verifiedAt: string;
    };
  };
}

// ── DigiLocker API Functions ─────────────────────────────────────────────────

export const initiateDigiLocker = async (
  redirectUrl?: string
): Promise<DigiLockerInitiateResponse> => {
  const res = await api.post("/verification/aadhaar/digilocker/initiate", {
    redirectUrl,
  });
  return res.data;
};

export const fetchDigiLockerResult = async (
  verificationId: string
): Promise<DigiLockerResultResponse> => {
  const res = await api.get(
    `/verification/aadhaar/digilocker/result/${verificationId}`
  );
  return res.data;
};

// ── Legacy OTP API Functions ─────────────────────────────────────────────────

export const sendAadhaarOtp = async (
  aadhaarNumber: string
): Promise<SendAadhaarOtpResponse> => {
  const res = await api.post("/verification/aadhaar/send-otp", {
    aadhaarNumber,
  });
  return res.data;
};

export const verifyAadhaarOtp = async (
  otp: string,
  refId: string,
  aadhaarNumber?: string
): Promise<VerifyAadhaarOtpResponse> => {
  const res = await api.post("/verification/aadhaar/verify-otp", {
    otp,
    refId,
    aadhaarNumber,
  });
  return res.data;
};

// ── Shared ───────────────────────────────────────────────────────────────────

export const getAadhaarStatus = async () => {
  const res = await api.get("/verification/aadhaar/status");
  return res.data;
};
