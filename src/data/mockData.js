import { createContact } from "../domain/entities/contact";

export const mockContacts = [
  createContact({
    id: "1",
    fullName: "Sarah Collins",
    relationshipType: "partner",
    primaryGemColor: "electricBlue",
    notesSummary: "Loves thoughtful experiences more than physical gifts.",
  }),
  createContact({
    id: "2",
    fullName: "Daniel Cooper",
    relationshipType: "friend",
    primaryGemColor: "sunsetOrange",
    notesSummary: "Appreciates books and coffee shop meetups.",
  }),
];

