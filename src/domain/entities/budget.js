export function createBudget({
  id,
  year,
  totalPlanned,
  perCategoryPlanned = {},
  currency = "USD",
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
}) {
  return {
    id,
    year,
    totalPlanned,
    perCategoryPlanned,
    currency,
    createdAt,
    updatedAt,
  };
}

