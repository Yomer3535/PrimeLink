## PrimeLink – Project Flow

This document tracks the step‑by‑step implementation of the PrimeLink app.  
We will only focus on **one concrete task at a time** and keep this file as the single source of truth for project progress.

---

### Phase 0 – Foundation & Planning
- **0.1 – Capture product vision** ✅  
  - Finalize the high‑level concept, philosophy, and feature set (done in the initial spec).

- **0.2 – Define implementation roadmap** ✅  
  - Create this `ProjectFlow.md` file and outline phases and tasks.

- **0.3 – Environment & tooling check** ✅  
  - Ensure JavaScript toolchain is available (Node, npm). ✅  
  - Confirm Expo CLI is available. ✅  
  - (On your local machine) ensure at least one simulator/device is configured for Expo (iOS Simulator, Android Emulator, or Expo Go on a device).

---

### Phase 1 – App Setup (Expo / React Native)
- **1.1 – Initialize app shell** ✅  
  - Create or reuse the Expo app in this directory (`PrimeLink/package.json`). ✅  
  - Verify that the app runs on at least one device/emulator (`npm run start` / Expo Go).

- **1.2 – Project structure & modules** ✅  
  - Define folder structure (e.g. `core`, `features`, `data`, `presentation`). ✅  
  - Add placeholders for key features (created as routes and feature folders):
    - `authentication_onboarding` → `app/onboarding`, basic onboarding screen. ✅  
    - `relationship_dashboard` → `app/index` + `src/features/relationshipDashboard`. ✅  
    - `relationship_profile` → `app/profile/[id].js`. ✅  
    - `financial_vault` → `app/vault/index.js`. ✅  
    - `idea_lab` → `app/ideas/index.js`. ✅  

- **1.3 – Add core dependencies** ⏳  
  - Add and configure:
    - `provider` or `flutter_bloc`
    - `hive` (+ `hive_flutter`) and/or `sqflite`
    - local notifications package (e.g. `flutter_local_notifications`)
    - biometric auth package (e.g. `local_auth`)

---

### Architecture Reference – Database Schema (Logical)
This section describes the **logical data model**. In implementation, these map to Hive boxes (and, if needed later, Sqflite tables).

- **Box/Table: `contacts`**
  - `id` (String, PK, UUID)
  - `fullName` (String)
  - `relationshipType` (String / enum: `partner`, `family`, `friend`, `business`, `other`)
  - `primaryGemColor` (String / enum: `electricBlue`, `sunsetOrange`, `emeraldGreen`)
  - `dateOfBirth` (Date?, optional)
  - `notesSummary` (String?, optional short summary / “about this person”)
  - `isArchived` (Bool, default `false`)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)

- **Box/Table: `contact_specs`**
  - `id` (String, PK)
  - `contactId` (String, FK → `contacts.id`)
  - `clothingSizes` (Map<String, String>? e.g. `{ "shirt": "M", "shoes": "42" }`)
  - `favoriteColors` (List<String>?)
  - `allergies` (List<String>?)
  - `wishlistItems` (List<String>?) – simple text list for MVP.

- **Box/Table: `milestones`** (key relationship dates)
  - `id` (String, PK)
  - `contactId` (String, FK → `contacts.id`)
  - `type` (String / enum: `birthday`, `anniversary`, `holiday`, `custom`)
  - `title` (String, e.g. "Anniversary", "First Date Anniversary")
  - `date` (DateTime)
  - `repeatRule` (String / enum: `none`, `yearly`, `customRule`) – MVP can use `none` / `yearly`.
  - `reminderOffsetDays` (int, days before event to notify, e.g. `7`)
  - `isActive` (Bool, default `true`)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)

- **Box/Table: `interactions`** (timeline of events, gifts, dates)
  - `id` (String, PK)
  - `contactId` (String, FK → `contacts.id`)
  - `milestoneId` (String?, FK → `milestones.id`, optional)
  - `type` (String / enum: `gift`, `experience`, `call`, `message`, `visit`, `other`)
  - `title` (String, e.g. "Dinner at X", "Birthday Gift")
  - `description` (String?)
  - `occurredAt` (DateTime)
  - `amount` (double?, monetary amount if applicable)
  - `currency` (String, ISO code, default from settings)
  - `spendCategory` (String / enum: `partner`, `family`, `friends`, `business`, `other`)
  - `sentiment` (int? 1–5 rating or enum for emotional reflection)
  - `mediaIds` (List<String>?, references `media_assets.id`)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)

- **Box/Table: `idea_cards`** (Idea Lab)
  - `id` (String, PK)
  - `contactId` (String?, FK → `contacts.id`, optional / generic idea)
  - `title` (String)
  - `description` (String?)
  - `imagePath` (String?, local file path)
  - `sourceUrl` (String?, optional link to product page)
  - `tags` (List<String>?) – e.g. `["tech", "jewelry"]`
  - `targetDate` (DateTime?, e.g. next birthday)
  - `linkedMilestoneId` (String?, FK → `milestones.id`)
  - `isArchived` (Bool, default `false`)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)

- **Box/Table: `budgets`**
  - `id` (String, PK) – can be `"global"` per year for MVP.
  - `year` (int)
  - `totalPlanned` (double)
  - `perCategoryPlanned` (Map<String, double>?; keys match spend categories)
  - `currency` (String)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)

- **Box/Table: `user_settings`**
  - `id` (String, PK, e.g. `"settings"`)
  - `isBiometricEnabled` (Bool)
  - `themeVariant` (String / enum, in case of future light/amoled variants)
  - `firstRunCompleted` (Bool)
  - `defaultCurrency` (String)
  - `notificationPreferences` (Map<String, dynamic> – e.g. `{ "milestoneReminders": true, "ideaReminders": true }`)

- **Box/Table: `notification_schedules`**
  - `id` (String, PK)
  - `contactId` (String?, FK → `contacts.id`)
  - `milestoneId` (String?, FK → `milestones.id`)
  - `ideaCardId` (String?, FK → `idea_cards.id`)
  - `scheduledFor` (DateTime)
  - `type` (String / enum: `milestone`, `idea`, `budget`)
  - `localNotificationId` (int, used by `flutter_local_notifications`)
  - `createdAt` (DateTime)

- **Box/Table: `media_assets`**
  - `id` (String, PK)
  - `filePath` (String, device path)
  - `thumbnailPath` (String?)
  - `sourceType` (String / enum: `camera`, `gallery`, `screenshot`, `fileImport`)
  - `createdAt` (DateTime)

> Implementation note: For the MVP, many of these structures can be stored as Hive `@HiveType` classes. Sqflite can be introduced later if you need more complex querying; the logical schema above will still hold.

---

### Architecture Reference – Flutter Folder Structure
Recommended high‑level structure for a clean, scalable Flutter codebase:

- **`lib/main.dart`**
  - App entry point, top‑level `runApp`, and minimal bootstrapping.

- **`lib/app/`**
  - `app.dart` – root `MaterialApp` / router configuration.
  - `routes.dart` – central route definitions.
  - `di.dart` – dependency injection / service locator setup (if used).

- **`lib/core/`** (cross‑cutting concerns)
  - `constants/` – static values, keys, enums.
  - `theme/` – dark theme, text styles, gem color tokens.
  - `widgets/` – reusable, generic widgets (buttons, glass panels, loaders).
  - `utils/` – helpers (formatting, date utilities, currency formatting).
  - `services/` – shared services (local notifications, biometric auth wrappers, file picker/media loader).
  - `errors/` – error models and handling utilities.

- **`lib/domain/`**
  - `entities/` – pure Dart models representing core domain (Contact, Milestone, Interaction, IdeaCard, Budget, UserSettings, etc.).
  - `repositories/` – abstract repository interfaces.
  - `usecases/` – application‑level actions (e.g. `GetUpcomingMilestones`, `LogInteraction`, `CreateIdeaCard`).

- **`lib/data/`**
  - `models/` – data models that map to Hive/Sqflite (DTOs) and convert to/from domain entities.
  - `datasources/`
    - `local/`
      - `hive/` – Hive adapters, box accessors.
      - `sqflite/` – (optional, later) SQL DAOs / queries.
  - `repositories_impl/` – concrete implementations of domain repositories using the data sources.

- **`lib/features/`** (feature‑oriented organization)
  - `authentication_onboarding/`
    - `presentation/` – pages, widgets, state (Provider/Bloc).
    - `application/` – feature‑specific use cases / controllers.
  - `relationship_dashboard/`
    - `presentation/` – dashboard screen, Connection Gem, priority list.
  - `relationship_profile/`
    - `presentation/` – profile screen, specs card, timeline.
  - `financial_vault/`
    - `presentation/` – analytics screens, charts, budget views.
  - `idea_lab/`
    - `presentation/` – idea cards grid/list, detail pages.

- **`lib/l10n/`** (optional, for localization)
  - ARB files and localization setup.

> Phase 1.2 (“Project structure & modules”) should implement the structure above, at least at a minimal, folder‑only level, so future phases can plug into it cleanly.

---

### Phase 2 – Design System & Theme
- **2.1 – Global theme (Dark / Opal)** ✅  
  - Implement app‑wide dark theme:
    - Primary background `#000000`. ✅  
    - Glassmorphism‑style surfaces (dark grey, low‑opacity overlays) via `GlassCard`. ✅  
  - Define base colors/tokens in `src/theme/colors.js`. ✅  

- **2.2 – Gem & Accent Tokens** ✅  
  - Define color tokens for:
    - Electric Blue
    - Sunset Orange
    - Emerald Green
  - Create reusable widgets/styles for “Connection Gems” and primary buttons:
    - `Gem` component in `src/core/components/Gem.js`. ✅  
    - `PrimaryButton` in `src/core/components/PrimaryButton.js`. ✅  

---

### Phase 3 – Authentication & Onboarding
- **3.1 – Splash screen with animated PrimeLink Gem** ⏳  
  - Create initial splash route and animation placeholder.

- **3.2 – Biometric gate** ⏳  
  - Integrate biometric unlock (Face ID / Touch ID) using local auth.

- **3.3 – First‑time onboarding flow** ⏳  
  - 3‑step introduction to:
    - Deep Focus concept.
    - Relationship + budget tracking.
    - Creating the first “Connection Project.”

---

### Phase 4 – Relationship Dashboard (Home)
- **4.1 – Connection Gem overview** ⏳  
  - Central gem widget that can reflect urgency based on upcoming events.

- **4.2 – Priority list** ⏳  
  - Vertical list of contacts sorted by nearest milestone.

- **4.3 – Quick interaction logging** ⏳  
  - Floating or primary button to add:
    - Gift idea
    - Amount spent
    - Short interaction note

---

### Phase 5 – Relationship Profiles (Project View)
- **5.1 – Profile layout & identity header** ⏳  
  - Name, relationship type, and profile gem.

- **5.2 – Specs card** ⏳  
  - Sizes, favorites, allergies, wishlist.

- **5.3 – Timeline log** ⏳  
  - List of gifts, events, and associated costs over time.

---

### Phase 6 – Financial Vault (Analytics)
- **6.1 – Spend breakdown charts** ⏳  
  - Donut charts by category (Partner / Family / Friends / Business).

- **6.2 – Annual budget tracker** ⏳  
  - Progress bar for “Budget Used” vs “Planned.”

- **6.3 – Export summary** ⏳  
  - Export yearly (or range‑based) financial summary.

---

### Phase 7 – Idea Lab (Scrapbook)
- **7.1 – Idea cards** ⏳  
  - Add image + text cards with tags.

- **7.2 – Reminders linked to contacts** ⏳  
  - Attach ideas to contacts and future dates (e.g., next birthday).

---

### Phase 8 – Polish & QA
- **8.1 – UX polish & micro‑animations** ⏳  
  - Smooth transitions, subtle gem glows, and haptics.

- **8.2 – Privacy & security review** ⏳  
  - Confirm all data is local and properly secured/encrypted.

- **8.3 – Bug fixing & performance checks** ⏳  
  - Test on multiple devices and screen sizes.

---

### Current Focus
- **Active Task:** `1.2 – Project structure & modules`  
  We will now (a) define and scaffold the folder structure inside the existing Expo app and (b) replace the default starter screen with the first version of the **PrimeLink** UI, using this document as the architecture and UX reference.

