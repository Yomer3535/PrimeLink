export function createIdeaCard({
  id,
  contactId = null,
  title,
  description = "",
  imagePath = null,
  sourceUrl = null,
  tags = [],
  targetDate = null,
  linkedMilestoneId = null,
  isArchived = false,
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
}) {
  return {
    id,
    contactId,
    title,
    description,
    imagePath,
    sourceUrl,
    tags,
    targetDate,
    linkedMilestoneId,
    isArchived,
    createdAt,
    updatedAt,
  };
}

