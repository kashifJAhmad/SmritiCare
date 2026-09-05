import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../constants/colors';
import { sizes } from '../../constants/sizes';

interface CustomTextInputProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function CustomTextInput({
  label,
  icon,
  ...textInputProps
}: CustomTextInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputContainer}>
        <Ionicons
          name={icon}
          size={24}
          color={colors.onSurfaceVariant}
          style={styles.icon}
        />

        <TextInput
          {...textInputProps}
          style={styles.input}
          placeholderTextColor={colors.onSurfaceVariant}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  label: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 8,
  },

  inputContainer: {
    minHeight: sizes.inputHeight,
    borderWidth: sizes.borderWidth,
    borderColor: colors.outlineVariant,
    borderRadius: sizes.radiusLg,
    backgroundColor: colors.surface,

    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    marginLeft: 12,
  },

  input: {
    flex: 1,
    minHeight: sizes.inputHeight,

    paddingHorizontal: 12,

    fontSize: 18,
    lineHeight: 28,
    color: colors.onSurface,
  },
});