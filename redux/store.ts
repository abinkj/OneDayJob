import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from "redux-persist";
import mmkvStorage from "./mmkvStore";

import authenticationReducer from "./reducers/authReducers";
import offlineSyncReducer from "./reducers/offlineSyncSlice";
import activeJobReducer from "./reducers/jobReducer";

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
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;  // ← use rootReducer not store.getState
export type AppDispatch = typeof store.dispatch;