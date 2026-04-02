// Core contact entity used across the app.

export function createContact({
  id,
  fullName,
  relationshipType = "other",
  primaryGemColor = "electricBlue",
  dateOfBirth = null,
  notesSummary = "",
  isArchived = false,
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
}) {
  return {
    id,
    fullName,
    relationshipType,
    primaryGemColor,
    dateOfBirth,
    notesSummary,
    isArchived,
    createdAt,
    updatedAt,
  };
}

