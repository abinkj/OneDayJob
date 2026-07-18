import { Middleware } from '@reduxjs/toolkit';

/**
 * A custom logger middleware that logs all dispatched actions and the resulting state.
 * This is very useful during development for debugging Redux state changes.
 */
export const loggerMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  // We only want to log in development
  if (__DEV__) {
    console.group(`[Redux Action] ${(action as any).type}`);
    console.log('Payload:', (action as any).payload);
    
    // Pass the action to the next middleware or the reducers
    const result = next(action);
    
    // Read the next state after the action has been processed
    console.log('Next State:', storeAPI.getState());
    console.groupEnd();
    
    return result;
  }

  // In production, just pass the action forward without logging
  return next(action);
};
