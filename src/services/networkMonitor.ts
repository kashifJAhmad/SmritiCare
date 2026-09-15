import { Platform } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type NetworkListener = (isOnline: boolean) => void;

class NetworkMonitor {
  private isOnline: boolean = true;
  private listeners: Set<NetworkListener> = new Set();
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    this.initialized = true;

    // Listen via NetInfo
    NetInfo.addEventListener((state: NetInfoState) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      this.updateStatus(online);
    });

    // Check initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      this.updateStatus(online);
    });

    // Extra web support
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('online', () => this.updateStatus(true));
      window.addEventListener('offline', () => this.updateStatus(false));
      this.updateStatus(window.navigator.onLine);
    }
  }

  private updateStatus(online: boolean) {
    if (this.isOnline !== online) {
      this.isOnline = online;
      this.listeners.forEach((listener) => {
        try {
          listener(online);
        } catch (e) {
          console.error('Error in network status listener:', e);
        }
      });
    }
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  public subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    listener(this.isOnline);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const networkMonitor = new NetworkMonitor();
