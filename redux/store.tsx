import { configureStore } from "@reduxjs/toolkit";
import authenticationReducer from "./reducers/authReducers";
import offlineSyncReducer from "./reducers/offlineSyncSlice";

// This file configures the Redux store and imports the authentication reducers.
export const store = configureStore({
  reducer: {
    authentication: authenticationReducer,
    offlineSync: offlineSyncReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;