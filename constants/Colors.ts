// Define the light theme colors
export const LightColors = {
    black: '#2A2A2A',
    white: '#fff',
    grey: '#555555',
    blue: "#613EEA",
    tabBlue: '#386BF6',
    tabGrey: '#9DB2CE',
    background: '#F9F5FF',
    primary: '#4F46E5', // Vibrant Indigo
    categoryBox: '#E0E8FD',
    selected: '#A6BEFF',
    subGrey: '#4A4A4A',
    switchBlue: '#65558F',
    switchGrey: '#E6E0E9',
    switchBorder: '#79747E',
    border: '#B0B0B0',
    addressGrey: '#E6E6E6',
    address2: '#F0F0F0',
    timeSelected: '#B8B8B8',
    green: '#EEFBEC',
    darkGreen: '#359928',
    borderGrey: '#767676',
    messagageBubble: '#CCCCCC',
    whiteBack: '#D9D9D9',
    iconBlack: '#1C274C',
    red: '#EE5050',
};

// Define the dark theme colors
export const DarkColors = {
    black: '#FFFFFF',        // Text becomes white
    white: '#1E1E1E',        // Surfaces become dark
    grey: '#AAAAAA',
    blue: "#816BEC",         // Lightened mainly for visibility
    tabBlue: '#386BF6',
    tabGrey: '#666666',
    background: '#121212',   // Dark background
    primary: '#6366F1',      // Slightly lighter indigo for dark mode
    categoryBox: '#2C2C2C',
    selected: '#3F4259',
    subGrey: '#CCCCCC',
    switchBlue: '#D0BCFF',
    switchGrey: '#36343B',
    switchBorder: '#938F99',
    border: '#444444',
    addressGrey: '#2A2A2A',
    address2: '#333333',
    timeSelected: '#555555',
    green: '#1E3320',
    darkGreen: '#66BB6A',
    borderGrey: '#555555',
    messagageBubble: '#444444',
    whiteBack: '#2C2C2C',
    iconBlack: '#FFFFFF',
    red: '#FF6B6B',
};

// Export individual colors object for backward compatibility (defaults to light)
export const Colors = LightColors;

export type ThemeColors = typeof LightColors;