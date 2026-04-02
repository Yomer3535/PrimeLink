export function createMilestone({
  id,
  contactId,
  type = "custom",
  title,
  date,
  repeatRule = "none",
  reminderOffsetDays = 7,
  isActive = true,
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
}) {
  return {
    id,
    contactId,
    type,
    title,
    date,
    repeatRule,
    reminderOffsetDays,
    isActive,
    createdAt,
    updatedAt,
  };
}

