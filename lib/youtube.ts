// Validates the YouTube URL formats we accept on the Add/Edit Job form:
//   https://www.youtube.com/watch?v=VIDEO_ID
//   https://youtu.be/VIDEO_ID
//   https://www.youtube.com/shorts/VIDEO_ID
// Used both client-side (HTML pattern attribute, see JobForm) and
// server-side (see lib/actions.ts) so an invalid value never gets saved.

const YOUTUBE_URL_REGEX =
  /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/)[\w-]{6,}(&\S*)?|youtu\.be\/[\w-]{6,}(\?\S*)?)$/i;

export function isValidYouTubeUrl(url: string): boolean {
  return YOUTUBE_URL_REGEX.test(url.trim());
}

// HTML `pattern` attributes must be unanchored-friendly and browser-safe;
// this mirrors YOUTUBE_URL_REGEX for use directly in JSX.
export const YOUTUBE_URL_HTML_PATTERN =
  "https?://(www\\.)?(youtube\\.com/(watch\\?v=|shorts/)[\\w-]{6,}(&\\S*)?|youtu\\.be/[\\w-]{6,}(\\?\\S*)?)";
