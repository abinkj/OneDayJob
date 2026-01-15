// Define the light theme colors - Softer, warmer palette
export const LightColors = {
    black: '#1A1A1A',           // Softer black for better readability
    white: '#FAFAFA',           // Soft white instead of pure white
    grey: '#6B7280',            // Modern neutral grey
    blue: "#5B4FD8",            // Slightly muted purple-blue
    tabBlue: '#4F7BE8',         // Softer tab blue
    tabGrey: '#94A3B8',         // Warmer tab grey
    background: '#F5F3FF',      // Softer lavender background
    primary: '#6366F1',         // Modern indigo
    categoryBox: '#E8E5FF',     // Softer category box
    categoryBox1: '#C7D2FE',    // Warmer category variant
    selected: '#A5B4FC',        // Softer selection color
    subGrey: '#52525B',         // Warmer sub-grey
    switchBlue: '#7C3AED',      // Vibrant purple for switches
    switchGrey: '#E5E7EB',      // Neutral switch grey
    switchBorder: '#9CA3AF',    // Softer border
    border: '#D1D5DB',          // Lighter, softer border
    addressGrey: '#F3F4F6',     // Very light grey for addresses
    address2: '#F9FAFB',        // Almost white for secondary
    timeSelected: '#CBD5E1',    // Softer time selection
    green: '#ECFDF5',           // Soft mint green
    darkGreen: '#10B981',       // Modern emerald green
    borderGrey: '#9CA3AF',      // Consistent border grey
    messagageBubble: '#E0E7FF', // Soft blue bubble
    whiteBack: '#E5E7EB',       // Warm light grey
    iconBlack: '#374151',       // Softer icon color
    red: '#EF4444',             // Modern red
};

// Define the dark theme colors - Elevated dark palette (not pure black)
export const DarkColors = {
    black: '#F9FAFB',           // Off-white text for reduced eye strain
    white: '#1F2937',           // Elevated dark surface
    grey: '#9CA3AF',            // Balanced grey for dark mode
    blue: "#8B7FE8",            // Lighter, more visible purple-blue
    tabBlue: '#60A5FA',         // Brighter tab blue for visibility
    tabGrey: '#6B7280',         // Elevated tab grey
    background: '#111827',      // Elevated dark background (not pure black)
    primary: '#818CF8',         // Lighter indigo for dark mode
    categoryBox: '#374151',     // Elevated category box
    categoryBox1: '#4B5563',    // Lighter category variant
    selected: '#4F46E5',        // Vibrant selection in dark mode
    subGrey: '#D1D5DB',         // Light grey for subtitles
    switchBlue: '#A78BFA',      // Lighter purple for switches
    switchGrey: '#374151',      // Elevated switch grey
    switchBorder: '#6B7280',    // Visible border
    border: '#4B5563',          // Elevated border
    addressGrey: '#374151',     // Elevated address background
    address2: '#1F2937',        // Slightly darker variant
    timeSelected: '#4B5563',    // Elevated time selection
    green: '#064E3B',           // Deep green background
    darkGreen: '#34D399',       // Bright emerald for visibility
    borderGrey: '#6B7280',      // Consistent border grey
    messagageBubble: '#374151', // Elevated message bubble
    whiteBack: '#374151',       // Elevated background
    iconBlack: '#F3F4F6',       // Light icon color
    red: '#F87171',             // Softer red for dark mode
};

// Export individual colors object for backward compatibility (defaults to light)
export const Colors = LightColors;

export type ThemeColors = typeof LightColors;