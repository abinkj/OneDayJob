import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { initializeStorage, getStorageInstance } from "./mmkvStore";

import en from "../assets/locales/en.json";
import es from "../assets/locales/es.json";
import ml from "../assets/locales/ml.json";

const LANGUAGE_KEY = "user-language";

const languageDetector: any = {
  type: "languageDetector",
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      // Ensure MMKV is ready before reading — fixes the race condition
      await initializeStorage();
      const savedLanguage = getStorageInstance().getString(LANGUAGE_KEY);
      callback(savedLanguage ?? "en");
    } catch (error) {
      console.error("Error detecting language:", error);
      callback("en");
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await initializeStorage();
      getStorageInstance().set(LANGUAGE_KEY, language);
    } catch (error) {
      console.error("Error caching language:", error);
    }
  },
};

i18n
  .use(initReactI18next)
  .use(languageDetector)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      ml: { translation: ml },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
