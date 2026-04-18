/**
 * Synchronous mirror of the device network state.
 * Axios interceptors can use this to quickly check connectivity
 * without the overhead of awaiting NetInfo on every request.
 */

let deviceIsOnline = true;

export const setDeviceOnline = (status: boolean) => {
  deviceIsOnline = status;
};

export const getDeviceOnline = () => {
  return deviceIsOnline;
};
