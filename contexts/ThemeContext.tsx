import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '../utilities/mmkvStore';
import { LightColors, DarkColors, ThemeColors } from '../constants/Colors';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeType;
    colors: ThemeColors;
    toggleTheme: () => void;
    setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'user_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [theme, setThemeState] = useState<ThemeType>('light');

    useEffect(() => {
        // Load saved theme or fallback to system
        try {
            const savedTheme = storage.getString(THEME_KEY);
            if (savedTheme === 'dark' || savedTheme === 'light') {
                setThemeState(savedTheme);
            } else {
                // Default to light if no preference, or could follow system:
                // setThemeState(systemScheme === 'dark' ? 'dark' : 'light');
                setThemeState('light'); // Defaulting to light as per current app style
            }
        } catch (error) {
            console.error('Failed to load theme preference:', error);
        }
    }, []);

    const setTheme = (newTheme: ThemeType) => {
        setThemeState(newTheme);
        storage.set(THEME_KEY, newTheme);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    const colors = theme === 'dark' ? DarkColors : LightColors;

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
