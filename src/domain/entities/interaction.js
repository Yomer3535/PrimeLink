export function createInteraction({
  id,
  contactId,
  milestoneId = null,
  type = "other",
  title,
  description = "",
  occurredAt = new Date().toISOString(),
  amount = null,
  currency = "USD",
  spendCategory = "other",
  sentiment = null,
  mediaIds = [],
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
}) {
  return {
    id,
    contactId,
    milestoneId,
    type,
    title,
    description,
    occurredAt,
    amount,
    currency,
    spendCategory,
    sentiment,
    mediaIds,
    createdAt,
    updatedAt,
  };
}

