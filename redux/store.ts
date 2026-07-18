import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { loggerMiddleware } from "./middleware/loggerMiddleware";
import { analyticsMiddleware } from "./middleware/analyticsMiddleware";
import {
  persistStore,
  persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from "redux-persist";
import mmkvStorage from "./mmkvStore";

import authenticationReducer from "./slices/authSlice";
import offlineSyncReducer from "./slices/offlineSyncSlice";
import activeJobReducer from "./slices/jobSlice";

const rootReducer = combineReducers({
  authentication: authenticationReducer,
  offlineSync: offlineSyncReducer,
  activeJob: activeJobReducer,
});

const persistConfig = {
  key: "root",
  storage: mmkvStorage,
  whitelist: ["activeJob"],   // only this slice persists across app restarts
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(loggerMiddleware, analyticsMiddleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;  // ← use rootReducer not store.getState
export type AppDispatch = typeof store.dispatch;