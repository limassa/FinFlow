import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const OfflineContext = createContext({
  isOnline: true,
  lastSyncedAt: null,
  enabled: true,
  setEnabled: async (_v) => {},
  saveCache: async (_key, _data) => {},
  loadCache: async (_key) => null,
  clearCache: async () => {},
});

const ENABLED_KEY = 'claricash_offline_enabled';
const META_KEY = 'claricash_offline_meta';
const cacheKey = (key) => `claricash_cache_${key}`;

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(true);
  const [enabled, setEnabledState] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [savedEnabled, metaRaw] = await Promise.all([
          AsyncStorage.getItem(ENABLED_KEY),
          AsyncStorage.getItem(META_KEY),
        ]);
        if (cancelled) return;
        if (savedEnabled === '0') setEnabledState(false);
        if (metaRaw) {
          const meta = JSON.parse(metaRaw);
          if (meta?.lastSyncedAt) setLastSyncedAt(meta.lastSyncedAt);
        }
      } catch (e) {
        console.log('Erro ao carregar config offline:', e);
      }
    })();

    const unsub = NetInfo.addEventListener((state) => {
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);
    });

    NetInfo.fetch().then((state) => {
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const setEnabled = useCallback(async (value) => {
    setEnabledState(!!value);
    try {
      await AsyncStorage.setItem(ENABLED_KEY, value ? '1' : '0');
    } catch (e) {
      console.log('Erro ao salvar config offline:', e);
    }
  }, []);

  const saveCache = useCallback(
    async (key, data) => {
      if (!enabled) return;
      try {
        const now = new Date().toISOString();
        await AsyncStorage.setItem(cacheKey(key), JSON.stringify(data));
        await AsyncStorage.setItem(META_KEY, JSON.stringify({ lastSyncedAt: now }));
        setLastSyncedAt(now);
      } catch (e) {
        console.log('Erro ao salvar cache offline:', e);
      }
    },
    [enabled]
  );

  const loadCache = useCallback(
    async (key) => {
      if (!enabled) return null;
      try {
        const raw = await AsyncStorage.getItem(cacheKey(key));
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.log('Erro ao ler cache offline:', e);
        return null;
      }
    },
    [enabled]
  );

  const clearCache = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((k) => k.startsWith('claricash_cache_') || k === META_KEY);
      if (cacheKeys.length) await AsyncStorage.multiRemove(cacheKeys);
      setLastSyncedAt(null);
    } catch (e) {
      console.log('Erro ao limpar cache offline:', e);
    }
  }, []);

  const value = useMemo(
    () => ({
      isOnline,
      lastSyncedAt,
      enabled,
      setEnabled,
      saveCache,
      loadCache,
      clearCache,
    }),
    [isOnline, lastSyncedAt, enabled, setEnabled, saveCache, loadCache, clearCache]
  );

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline() {
  return useContext(OfflineContext);
}
