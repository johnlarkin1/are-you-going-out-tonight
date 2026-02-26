import React, { createContext, useContext, useEffect, useState } from 'react';
import { getOrCreateDeviceId } from './deviceId';

interface DeviceIdState {
  deviceId: string | null;
  isReady: boolean;
}

const DeviceIdContext = createContext<DeviceIdState>({ deviceId: null, isReady: false });

export function DeviceIdProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DeviceIdState>({ deviceId: null, isReady: false });

  useEffect(() => {
    getOrCreateDeviceId().then((id) => {
      setState({ deviceId: id, isReady: true });
    });
  }, []);

  return (
    <DeviceIdContext.Provider value={state}>
      {children}
    </DeviceIdContext.Provider>
  );
}

/** Returns the device ID string. Throws if called before the provider is ready. */
export function useDeviceId(): string {
  const { deviceId } = useContext(DeviceIdContext);
  if (!deviceId) {
    throw new Error('useDeviceId() called before DeviceIdProvider is ready');
  }
  return deviceId;
}

/** Returns { deviceId, isReady } — use for the loading gate. */
export function useDeviceIdStatus(): DeviceIdState {
  return useContext(DeviceIdContext);
}
