import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { mockContacts } from "../../data/mockData";
import { createContact } from "../../domain/entities/contact";
import {
  loadContacts,
  saveContacts,
  loadContactSpecs,
  saveContactSpecs,
  loadIsPremium,
  saveIsPremium,
  loadCurrency,
  saveCurrency,
} from "../storage/persistence";
import { initFirebase } from "../services/firebase";

initFirebase();

const AppStateContext = createContext(null);

const INITIAL_SPECS = {
  "1": {
    loveLanguage: "Words of Affirmation",
    allergies: "None",
    ringSize: "7",
    dislikes: "Cold weather, being late",
    specialDays: "Met: Mar 15 2022 · First date: Mar 20 2022",
    customFields: {},
  },
  "2": {
    loveLanguage: "",
    allergies: "Perfume",
    ringSize: "",
    dislikes: "",
    specialDays: "",
    customFields: {},
  },
};

export function AppStateProvider({ children }) {
  const [contacts, setContacts] = useState(mockContacts);
  const [contactSpecs, setContactSpecs] = useState(INITIAL_SPECS);
  const [isPremium, setIsPremium] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const [storedContacts, storedSpecs, storedPremium, storedCurrency] = await Promise.all([
        loadContacts(),
        loadContactSpecs(),
        loadIsPremium(),
        loadCurrency(),
      ]);
      if (Array.isArray(storedContacts) && storedContacts.length > 0) {
        setContacts(storedContacts);
      }
      if (storedSpecs && typeof storedSpecs === "object") {
        setContactSpecs(storedSpecs);
      }
      if (storedPremium !== null) {
        setIsPremium(storedPremium);
      }
      if (storedCurrency) {
        setCurrency(storedCurrency);
      }
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveContacts(contacts);
  }, [contacts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveContactSpecs(contactSpecs);
  }, [contactSpecs, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveIsPremium(isPremium);
  }, [isPremium, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveCurrency(currency);
  }, [currency, hydrated]);

  const value = useMemo(
    () => ({
      contacts,
      contactSpecs,
      isPremium,
      setIsPremium,
      currency,
      setCurrency,
      addContact: ({ fullName, relationshipType = "other" }) => {
        if (!isPremium && contacts.length >= 3) {
          return { ok: false, reason: "limit" };
        }
        const id = Date.now().toString();
        const newContact = createContact({
          id,
          fullName,
          relationshipType,
        });
        setContacts((prev) => [...prev, newContact]);
        return { ok: true, id };
      },
      updateContactSpecs: (id, patch) => {
        setContactSpecs((prev) => {
          const curr = prev[id] || {};
          const { customFields: patchCf, ...rest } = patch;
          return {
            ...prev,
            [id]: {
              ...curr,
              ...rest,
              customFields: patchCf !== undefined ? patchCf : (curr.customFields || {}),
            },
          };
        });
      },
      addCustomField: (contactId, fieldKey, value) => {
        setContactSpecs((prev) => ({
          ...prev,
          [contactId]: {
            ...(prev[contactId] || {}),
            customFields: {
              ...(prev[contactId]?.customFields || {}),
              [fieldKey]: value,
            },
          },
        }));
      },
      removeCustomField: (contactId, fieldKey) => {
        setContactSpecs((prev) => {
          const custom = { ...(prev[contactId]?.customFields || {}) };
          delete custom[fieldKey];
          return {
            ...prev,
            [contactId]: {
              ...(prev[contactId] || {}),
              customFields: custom,
            },
          };
        });
      },
    }),
    [contacts, contactSpecs, isPremium, currency]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return ctx;
}
