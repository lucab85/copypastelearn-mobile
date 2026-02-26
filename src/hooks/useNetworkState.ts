import { useEffect, useState } from "react";

let NetInfo: any = null;
try {
  NetInfo = require("@react-native-community/netinfo").default;
} catch {
  // NetInfo unavailable — assume online
}

export function useNetworkState() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (!NetInfo) return;
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  return { isConnected };
}
