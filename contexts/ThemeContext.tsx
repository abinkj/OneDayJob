import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { initializeStorage, storage } from '../utilities/mmkvStore';
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
    const [isStorageReady, setIsStorageReady] = useState(false);

    useEffect(() => {
        // Load saved theme or fallback to system
        const loadTheme = async () => {
            try {
                // Ensure storage is initialized first
                await initializeStorage();
                setIsStorageReady(true);

                const savedTheme = storage.getString(THEME_KEY);
                if (savedTheme === 'dark' || savedTheme === 'light') {
                    setThemeState(savedTheme);
                } else {
                    // Default to light if no preference
                    setThemeState('light');
                }
            } catch (error) {
                console.error('Failed to load theme preference:', error);
                // Fallback to light theme on error
                setThemeState('light');
            }
        };

        loadTheme();
    }, []);


    const setTheme = async (newTheme: ThemeType) => {
        setThemeState(newTheme);
        try {
            // Ensure storage is ready before saving
            if (isStorageReady) {
                storage.set(THEME_KEY, newTheme);
            } else {
                // If storage isn't ready yet, wait for it
                await initializeStorage();
                storage.set(THEME_KEY, newTheme);
            }
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
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
