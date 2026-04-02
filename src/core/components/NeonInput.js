import { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

/**
 * Neon-styled input field:
 *  - Bright white text, Electric Blue cursor
 *  - On focus: neon blue border glow
 *  - textCapitalization, textInputAction, keyboardType support
 */
export function NeonInput({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  style,
  textCapitalization,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.wrapper,
        focused && styles.wrapperFocused,
        multiline && styles.wrapperMultiline,
        style,
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(122,127,142,0.6)"
        keyboardType={keyboardType || "default"}
        multiline={multiline}
        textCapitalization={textCapitalization ?? "sentences"}
        returnKeyType={returnKeyType || "next"}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={blurOnSubmit ?? !multiline}
        selectionColor={colors.gemElectricBlue}
        cursorColor={colors.gemElectricBlue}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, multiline && styles.inputMultiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    overflow: "hidden",
  },
  wrapperFocused: {
    borderColor: "rgba(59,130,246,0.5)",
    shadowColor: colors.gemElectricBlue,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },
  wrapperMultiline: {
    minHeight: 70,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 13,
  },
  inputMultiline: {
    minHeight: 70,
    textAlignVertical: "top",
  },
});
