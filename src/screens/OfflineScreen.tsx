import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const COLORS = {
  background: '#FCF9F8',
  surface: '#FCF9F8',
  surfaceLowest: '#FFFFFF',
  surfaceVariant: '#E5E2E1',
  surfaceContainer: '#F0EDED',
  primary: '#00450D',
  primaryContainer: '#1B5E20',
  onPrimaryContainer: '#90D689',
  secondary: '#556158',
  outline: '#717A6D',
  outlineVariant: '#C0C9BB',
  onSurface: '#1B1C1C',
  onSurfaceVariant: '#41493E',
};

type OfflineScreenProps = {
  onBack?: () => void;
  onHome?: () => void;
};

export default function OfflineScreen({
  onBack,
  onHome,
}: OfflineScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          onPress={onBack}
          style={styles.headerButton}
        >
          <MaterialIcons
            name="arrow-back"
            size={28}
            color={COLORS.primary}
          />
        </Pressable>

        <Text style={styles.headerTitle}>SmritiCare</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Offline Mode</Text>
        </View>

        {/* Connectivity Banner */}
        <View style={styles.connectivityBanner}>
          <MaterialIcons
            name="wifi-off"
            size={32}
            color={COLORS.onSurfaceVariant}
          />

          <Text style={styles.connectivityText}>
            Offline - Activities are being saved locally.
          </Text>
        </View>

        {/* Feature Status */}
        <View style={styles.featureSection}>
          <Text style={styles.sectionTitle}>Feature Status</Text>

          {/* Games */}
          <FeatureCard
            icon="sports-esports"
            title="Games"
            status="Available"
            available
          />

          {/* Reminders */}
          <FeatureCard
            icon="notifications-active"
            title="Reminders"
            status="Working"
            available
          />

          {/* Sync */}
          <FeatureCard
            icon="cloud-sync"
            title="Sync"
            status="Pending"
            available={false}
          />
        </View>

        {/* Pending Synchronization */}
        <View style={styles.syncCard}>
          <View style={styles.syncHeader}>
            <Text style={styles.cardTitle}>
              Pending Synchronization
            </Text>

            <View style={styles.itemBadge}>
              <Text style={styles.itemBadgeText}>4 items</Text>
            </View>
          </View>

          <View style={styles.progressBackground}>
            <View style={styles.progressBar} />
          </View>

          <Text style={styles.waitingText}>
            Waiting for connection...
          </Text>
        </View>

        {/* Information Card */}
        <View style={styles.infoCard}>
          <MaterialIcons
            name="info"
            size={25}
            color={COLORS.primary}
          />

          <Text style={styles.infoText}>
            Your activities will sync automatically when you reconnect
            to the internet. No manual action is needed.
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.actions}>
          {/* Manual Sync */}
          <Pressable
            disabled
            style={[styles.button, styles.disabledButton]}
          >
            <MaterialIcons
              name="sync"
              size={24}
              color={COLORS.onSurfaceVariant}
            />

            <Text style={styles.disabledButtonText}>
              Manual Sync
            </Text>
          </Pressable>

          {/* Back to Home */}
          <Pressable
            onPress={onHome}
            style={styles.homeButton}
          >
            <MaterialIcons
              name="home"
              size={24}
              color={COLORS.primary}
            />

            <Text style={styles.homeButtonText}>
              Back to Home
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------
   Feature Card
------------------------------------------------------- */

type FeatureCardProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  status: string;
  available: boolean;
};

function FeatureCard({
  icon,
  title,
  status,
  available,
}: FeatureCardProps) {
  return (
    <View
      style={[
        styles.featureCard,
        !available && styles.featureCardPending,
      ]}
    >
      <View
        style={[
          styles.featureIcon,
          !available && styles.featureIconPending,
        ]}
      >
        <MaterialIcons
          name={icon}
          size={27}
          color={
            available
              ? COLORS.onPrimaryContainer
              : COLORS.onSurfaceVariant
          }
        />
      </View>

      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>

        <Text
          style={[
            styles.featureStatus,
            !available && styles.pendingText,
          ]}
        >
          {status}
        </Text>
      </View>

      <MaterialIcons
        name={available ? 'check-circle' : 'pending'}
        size={27}
        color={available ? COLORS.primary : COLORS.outline}
      />
    </View>
  );
}

/* -------------------------------------------------------
   Styles
------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerSpacer: {
    width: 44,
  },

  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: COLORS.primary,
  },

  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 32,
  },

  pageHeader: {
    marginBottom: 16,
  },

  pageTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  connectivityBanner: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: COLORS.surfaceVariant,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 12,
  },

  connectivityText: {
    flex: 1,
    fontSize: 20,
    lineHeight: 28,
    color: COLORS.onSurfaceVariant,
  },

  featureSection: {
    marginTop: 28,
    gap: 12,
  },

  sectionTitle: {
    marginBottom: 4,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORS.secondary,
  },

  featureCard: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
  },

  featureCardPending: {
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainer,
    opacity: 0.8,
  },

  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryContainer,
  },

  featureIconPending: {
    backgroundColor: COLORS.surfaceVariant,
  },

  featureContent: {
    flex: 1,
  },

  featureTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORS.onSurface,
  },

  featureStatus: {
    marginTop: 2,
    fontSize: 20,
    lineHeight: 28,
    color: COLORS.primary,
  },

  pendingText: {
    color: COLORS.outline,
  },

  syncCard: {
    marginTop: 24,
    padding: 20,
    backgroundColor: COLORS.surfaceLowest,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
  },

  syncHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },

  cardTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORS.onSurface,
  },

  itemBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceVariant,
  },

  itemBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },

  progressBackground: {
    width: '100%',
    height: 12,
    overflow: 'hidden',
    borderRadius: 6,
    backgroundColor: COLORS.surfaceVariant,
  },

  progressBar: {
    width: '25%',
    height: '100%',
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
    opacity: 0.6,
  },

  waitingText: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.onSurfaceVariant,
    opacity: 0.8,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginTop: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: COLORS.surfaceContainer,
  },

  infoText: {
    flex: 1,
    fontSize: 20,
    lineHeight: 28,
    color: COLORS.onSurface,
  },

  actions: {
    gap: 16,
    marginTop: 32,
    paddingTop: 16,
  },

  button: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 12,
  },

  disabledButton: {
    backgroundColor: COLORS.surfaceVariant,
    opacity: 0.5,
  },

  disabledButtonText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },

  homeButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },

  homeButtonText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORS.primary,
  },
});