import { Middleware } from '@reduxjs/toolkit';

/**
 * A custom analytics middleware that listens for specific actions and sends
 * event data to your analytics provider (e.g., Mixpanel, Firebase, Amplitude).
 */
export const analyticsMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  // Pass the action down the chain first (optional: you could do it after)
  const result = next(action);

  // Check the action type and dispatch an analytics event
  const actionType = (action as any).type;
  
  if (actionType === 'auth/login') {
    // Example: Track login
    console.log('[Analytics] Track Event: User Logged In', (action as any).payload);
    // analyticsProvider.track('Login', { userId: action.payload.id });
  } 
  else if (actionType === 'auth/logout') {
    // Example: Track logout
    console.log('[Analytics] Track Event: User Logged Out');
    // analyticsProvider.track('Logout');
  }

  return result;
};
