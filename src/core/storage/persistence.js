import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  CONTACTS: "primelink_contacts",
  CONTACT_SPECS: "primelink_contact_specs",
  IS_PREMIUM: "primelink_is_premium",
  CURRENCY: "primelink_currency",
  EVENTS: "primelink_events",
  IDEAS: "primelink_ideas",
};

export async function loadContacts() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CONTACTS);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveContacts(contacts) {
  try {
    await AsyncStorage.setItem(KEYS.CONTACTS, JSON.stringify(contacts));
  } catch (_) {}
}

export async function loadContactSpecs() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CONTACT_SPECS);
    const data = raw ? JSON.parse(raw) : null;
    if (data && typeof data === "object") {
      Object.keys(data).forEach((id) => {
        if (data[id] && !data[id].customFields) data[id].customFields = {};
      });
    }
    return data;
  } catch {
    return null;
  }
}

export async function saveContactSpecs(specs) {
  try {
    await AsyncStorage.setItem(KEYS.CONTACT_SPECS, JSON.stringify(specs));
  } catch (_) {}
}

export async function loadIsPremium() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.IS_PREMIUM);
    return raw === "true";
  } catch {
    return null;
  }
}

export async function saveIsPremium(value) {
  try {
    await AsyncStorage.setItem(KEYS.IS_PREMIUM, String(value));
  } catch (_) {}
}

export async function loadCurrency() {
  try {
    return await AsyncStorage.getItem(KEYS.CURRENCY);
  } catch {
    return null;
  }
}

export async function saveCurrency(value) {
  try {
    await AsyncStorage.setItem(KEYS.CURRENCY, value);
  } catch (_) {}
}

export async function loadEvents() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.EVENTS);
    if (!raw) return null;
    const arr = JSON.parse(raw);
    return arr.map((e) => ({ ...e, date: new Date(e.date) }));
  } catch {
    return null;
  }
}

export async function saveEvents(events) {
  try {
    await AsyncStorage.setItem(
      KEYS.EVENTS,
      JSON.stringify(events.map((e) => ({ ...e, date: e.date?.toISOString?.() ?? e.date })))
    );
  } catch (_) {}
}

export async function loadIdeas() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.IDEAS);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveIdeas(ideas) {
  try {
    await AsyncStorage.setItem(KEYS.IDEAS, JSON.stringify(ideas));
  } catch (_) {}
}
