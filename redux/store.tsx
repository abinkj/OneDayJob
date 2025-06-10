import { configureStore } from "@reduxjs/toolkit";
import authenticationReducer from "./reducers/authReducers";
// This file configures the Redux store and imports the authentication reducers.
export const store = configureStore({
  reducer: {
    authentication: authenticationReducer,
  },
});
