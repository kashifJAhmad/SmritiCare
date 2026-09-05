import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../constants/colors';
import { sizes } from '../../constants/sizes';

interface PrimaryButtonProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  loading?: boolean;
}

export default function PrimaryButton({
  title,
  icon,
  onPress,
  loading = false,
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={24}
              color={colors.onPrimary}
              style={styles.icon}
            />
          )}

          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: sizes.buttonHeight,

    backgroundColor: colors.primary,

    borderRadius: sizes.radiusXl,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 16,
  },

  pressed: {
    transform: [{ scale: 0.98 }],
  },

  icon: {
    marginRight: 8,
  },

  text: {
    color: colors.onPrimary,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
});