/**
 * Initialize a bridge between the API layer and the Redux store.
 * This avoids circular dependencies by holding a dynamic reference to the dispatch function.
 */

import { AppDispatch } from "../redux/store";

let dispatchReference: AppDispatch | null = null;

export const setSyncDispatch = (dispatch: AppDispatch) => {
  dispatchReference = dispatch;
};

export const getSyncDispatch = (): AppDispatch => {
  if (!dispatchReference) {
    throw new Error(
      "Sync bridge not initialized. Call setSyncDispatch during app startup."
    );
  }
  return dispatchReference;
};
