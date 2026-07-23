/**
 * Formats a date string to a human-readable chat time.
 * - Same day: 07:30 PM
 * - Yesterday: Yesterday
 * - Older: MM/DD/YYYY
 */
export const formatTime = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const days = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 0)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString();
};

/**
 * Resolves an avatar URL from a user/participant object.
 * Prioritizes full URLs (CloudFront) over relative S3 keys.
 * Returns an empty string if no valid HTTP URL is found.
 */
export const resolveAvatar = (user: any): string => {
  const url = user?.profilePictureUrl || user?.profilePicture;
  return url && typeof url === "string" && url.startsWith("http") ? url : "";
};

/**
 * Normalizes a user ID from various possible structures (string, object with id, object with _id).
 */
export const normalizeUserId = (data: any): string => {
  if (!data) return "";
  if (typeof data === "string") return data;
  return String(data.id || data._id || "");
};
