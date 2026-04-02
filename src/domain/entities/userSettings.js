export function createUserSettings({
  id = "settings",
  isBiometricEnabled = false,
  themeVariant = "dark",
  firstRunCompleted = false,
  defaultCurrency = "USD",
  notificationPreferences = {
    milestoneReminders: true,
    ideaReminders: true,
  },
}) {
  return {
    id,
    isBiometricEnabled,
    themeVariant,
    firstRunCompleted,
    defaultCurrency,
    notificationPreferences,
  };
}

