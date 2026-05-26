import { StyleSheet } from "react-native";
import { colors, typography, spacing } from "./theme";

export const commonStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  spaceBetween: {
    justifyContent: "space-between",
  },

  // Typography
  text: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  textBold: {
    fontFamily: typography.fontFamily.semiBold,
  },
  textLarge: {
    fontSize: typography.fontSize.lg,
  },
  textSmall: {
    fontSize: typography.fontSize.sm,
  },

  // Inputs
  input: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: 12,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  // Buttons
  button: {
    padding: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: colors.primary.main,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },

  // Modals
  modalContainer: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  // Cards
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  // Lists
  listItem: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
