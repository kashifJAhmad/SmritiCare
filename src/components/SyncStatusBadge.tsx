import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { syncManager, SyncState } from '../services/syncManager';

export default function SyncStatusBadge() {
  const [syncState, setSyncState] = useState<SyncState>('SYNCED');
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = syncManager.subscribe((state, count) => {
      setSyncState(state);
      setPendingCount(count);
    });
    return unsubscribe;
  }, []);

  const handlePress = () => {
    syncManager.triggerSync();
  };

  // If online and fully synced with 0 pending items, show subtle indicator or synced pill
  if (syncState === 'SYNCED' && pendingCount === 0) {
    return (
      <View style={styles.containerSynced}>
        <View style={styles.dotGreen} />
        <Text style={styles.textSynced}>Synced</Text>
      </View>
    );
  }

  if (syncState === 'SYNCING') {
    return (
      <View style={styles.containerSyncing}>
        <MaterialIcons name="sync" size={14} color="#00629E" style={styles.spinIcon} />
        <Text style={styles.textSyncing}>Syncing...</Text>
      </View>
    );
  }

  if (syncState === 'OFFLINE') {
    return (
      <Pressable onPress={handlePress} style={styles.containerOffline}>
        <View style={styles.dotOrange} />
        <Text style={styles.textOffline}>
          Offline {pendingCount > 0 ? `(${pendingCount} queued)` : ''}
        </Text>
      </Pressable>
    );
  }

  // Pending
  return (
    <Pressable onPress={handlePress} style={styles.containerPending}>
      <MaterialIcons name="cloud-upload" size={14} color="#A86B00" />
      <Text style={styles.textPending}>
        {pendingCount} pending • Tap to sync
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  containerSynced: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E2F3E0',
    alignSelf: 'center',
  },
  dotGreen: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
    marginRight: 6,
  },
  textSynced: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1B5E20',
  },
  containerSyncing: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#D7EEFF',
    alignSelf: 'center',
  },
  spinIcon: {
    marginRight: 5,
  },
  textSyncing: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00629E',
  },
  containerOffline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFF3CD',
    alignSelf: 'center',
  },
  dotOrange: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E65100',
    marginRight: 6,
  },
  textOffline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#704600',
  },
  containerPending: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFF3CD',
    alignSelf: 'center',
  },
  textPending: {
    fontSize: 12,
    fontWeight: '600',
    color: '#704600',
    marginLeft: 5,
  },
});
