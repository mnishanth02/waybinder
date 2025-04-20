import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real, // Using real from Schema 2 for measurements
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ---------- ENUMS (Consolidated & Refined) ----------

export const userRoleEnum = pgEnum("user_role", ["logged_in", "athlete", "admin"]); // Simplified slightly, anonymous isn't a DB role
export const journeyTypeEnum = pgEnum("journey_type", [
  // Combine/refine from both schemas
  "trekking", // Schema 1
  "trail_running", // Schema 1
  "mountaineering", // Schema 1
  "cycling_touring", // Schema 1/2
  "cycling_road", // Added
  "cycling_mountain", // Added
  "ski_touring", // Schema 1
  "ski_alpine", // Added
  "climbing_expedition", // Added
  "road_trip", // Schema 2
  "travel", // Schema 1
  "weekend_getaway", // Schema 2
  "single_day_outing", // Schema 2
  "paddling", // Added
  "other",
]);
export const privacyStatusEnum = pgEnum("privacy_status", ["private", "unlisted", "public"]); // Schema 1 name preferred
export const collaboratorRoleEnum = pgEnum("collaborator_role", ["buddy", "group_member"]);
export const collaboratorStatusEnum = pgEnum("collaborator_status", ["pending", "accepted"]);
export const planningItemTypeEnum = pgEnum("planning_item_type", [
  // For templates and maybe future unified planning
  "checklist",
  "gear_list",
  "permit",
  "travel",
  "contact",
  "todo", // Schema 1 had todo
  "budget",
]);
export const planningItemStatusEnum = pgEnum("planning_item_status", [
  // For Permits, Travel, Contacts, Budget items
  "todo",
  "in_progress",
  "done",
  "not_applicable", // Schema 1
  "acquired", // Specific for permits/tickets
  "pending", // Specific for permits/applications
  "cancelled",
]);
export const mediaTypeEnum = pgEnum("media_type", [
  "image",
  "video",
  "gpx",
  "document",
  "audio",
  "other",
]); // Schema 1/2 combined
export const activityTypeEnum = pgEnum("activity_type", [
  // Combine/refine from both schemas
  "hike", // Schema 1 (trekking often implies multi-day)
  "run", // Schema 1 (trail_running often implies specific type)
  "cycle", // Schema 1 (covers various cycling)
  "drive", // Schema 1
  "fly", // Schema 1
  "train", // Schema 1
  "boat", // Schema 1 / Schema 2 Kayaking
  "kayak", // More specific
  "canoe", // More specific
  "rest", // Schema 1
  "camp", // Schema 1
  "climb", // Schema 1
  "ski", // Schema 1 (covers various skiing)
  "mountaineer", // Added for non-ski/climb alpine
  "sightseeing", // Schema 2
  "travel", // Schema 2 (generic transition)
  "other",
]);
export const contactTypeEnum = pgEnum("contact_type", [
  "emergency",
  "accommodation",
  "guide",
  "transport", // Added
  "local_authority",
  "partner", // Added e.g., tour operator
  "other",
]);
export const experienceLevelEnum = pgEnum("experience_level", [
  // NEW from previous analysis
  "beginner",
  "intermediate",
  "advanced",
  "expert",
  "other",
]);
export const sportEnum = pgEnum("sport", [
  // NEW from previous analysis
  "trekking",
  "trail_running",
  "mountaineering",
  "cycling_road",
  "cycling_mountain",
  "cycling_gravel",
  "cycling_touring",
  "ski_touring",
  "ski_alpine",
  "climbing_rock",
  "climbing_ice",
  "climbing_alpine",
  "hiking",
  "running",
  "paddling",
  "other",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  // From Schema 2
  "new_follower",
  "new_comment",
  "journey_invite",
  "invite_accepted", // Added
  "mention",
  "journey_update", // e.g., new activity added by collaborator
  "planning_assignment", // Added
]);
export const travelTypeEnum = pgEnum("travel_type", [
  "flight",
  "train",
  "bus",
  "ferry",
  "car_rental",
  "shuttle",
  "taxi",
  "rideshare",
  "private_vehicle",
  "transfer",
  "other",
]);
export const budgetCategoryEnum = pgEnum("budget_category", [
  "transport",
  "accommodation",
  "food",
  "gear",
  "permits_fees",
  "insurance",
  "guides",
  "communication",
  "entertainment",
  "gifts",
  "emergency",
  "other",
]);
export const entityTypeEnum = pgEnum("entity_type", [
  "journey",
  "activity",
  "comment",
  "user",
  "planning_item",
  "media",
]);
export const currencyEnum = pgEnum("currency", [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
  "CHF",
  "CNY",
  "INR",
  "NZD",
  "SGD",
  "HKD",
  "NOK",
  "SEK",
  "DKK",
  "ZAR",
  "BRL",
  "MXN",
  "RUB",
  "THB",
  "ILS",
  "PLN",
  "KRW",
  "TRY",
]);

// ---------- TABLES (Combined & Enhanced) ----------

// --- Core User & Auth ---
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: varchar("username", { length: 50 }).unique(), // Optional but recommended for clean URLs/mentions
    email: varchar("email", { length: 255 }).unique().notNull(),
    hashedPassword: text("hashed_password"),
    authProvider: text("auth_provider").default("email"),
    providerId: text("provider_id"),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    displayName: varchar("display_name", { length: 150 }), // ADDED: Derived initially, user-editable.
    profilePictureUrl: text("profile_picture_url"), // MOVED HERE
    role: userRoleEnum("role").default("logged_in").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()), // Use $onUpdate
    emailVerified: timestamp("email_verified", { withTimezone: true }),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email), // Schema 2 naming
    usernameIdx: uniqueIndex("users_username_idx").on(table.username),
    providerIdx: index("users_provider_idx").on(table.authProvider, table.providerId),
    displayNameIdx: index("users_display_name_idx").on(table.displayName),
  })
);

// --- Athlete Specific Profile ---
export const athleteProfiles = pgTable("athlete_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  coverPhotoUrl: text("cover_photo_url"), // Specific to athlete page
  homeLocation: text("home_location"), // Could be structured JSONB later if needed { city, region, country }
  experienceLevel: experienceLevelEnum("experience_level"), // USE ENUM
  websiteUrl: text("website_url"),
  stravaUrl: text("strava_url"), // Consistent naming Url
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"), // ADDED
  youtubeUrl: text("youtube_url"), // Schema 2
  twitterUrl: text("twitter_url"), // ADDED
  otherLinks: jsonb("other_links"), // Schema 2: For flexibility [{ name: 'Komoot', url: '...' }]
  goals: text("goals"), // ADDED: Athlete's current or future goals
  highlights: text("highlights"), // ADDED: Notable achievements, expeditions, etc.
  sponsors: text("sponsors"), // ADDED: List or description of sponsors
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// --- Athlete's Sports/Disciplines ---
export const athleteSports = pgTable(
  "athlete_sports",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sport: sportEnum("sport").notNull(),
    yearsExperience: integer("years_experience"),
    notes: text("notes"),
    isPrimary: boolean("is_primary").default(false),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.sport] }),
    userIdx: index("athlete_sports_user_idx").on(table.userId),
    sportIdx: index("athlete_sports_sport_idx").on(table.sport),
  })
);

// --- Journeys ---
export const journeys = pgTable(
  "journeys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    shortDescription: varchar("short_description", { length: 500 }), // Schema 2: Good for previews
    slug: varchar("slug", { length: 300 }).unique().notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    journeyType: journeyTypeEnum("journey_type"),
    tags: text("tags").array(),
    privacyStatus: privacyStatusEnum("privacy_status").default("private").notNull(), // Schema 1 name
    coverImageUrl: text("cover_image_url"), // Simple text URL for now
    // coverMediaId: uuid("cover_media_id").references(() => media.id, { onDelete: "set null" }), // Alternative: Link to media table
    location: text("location"), // e.g., "Chamonix Valley, France"
    // Optional derived/cached stats from Schema 2
    totalDistanceKm: real("total_distance_km"), // Use real/float
    totalElevationGainM: real("total_elevation_gain_m"),
    // locationGeo: geometry('location_geo', { srid: 4326 }), // Optional PostGIS field
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    publishedAt: timestamp("published_at", { withTimezone: true }), // When first made public/unlisted
  },
  (table) => ({
    creatorIdx: index("journeys_creator_idx").on(table.creatorId),
    slugIdx: uniqueIndex("journeys_slug_idx").on(table.slug),
    dateIdx: index("journeys_date_idx").on(table.startDate, table.endDate),
    privacyIdx: index("journeys_privacy_idx").on(table.privacyStatus),
    typeIdx: index("journeys_type_idx").on(table.journeyType),
    createdAtIdx: index("journeys_created_at_idx").on(table.createdAt),
    publishedAtIdx: index("journeys_published_at_idx").on(table.publishedAt),
    // Composite indexes for common query patterns
    privacyCreatedIdx: index("journeys_privacy_created_idx").on(
      table.privacyStatus,
      table.createdAt
    ),
    creatorPrivacyIdx: index("journeys_creator_privacy_idx").on(
      table.creatorId,
      table.privacyStatus
    ),
    typePrivacyIdx: index("journeys_type_privacy_idx").on(table.journeyType, table.privacyStatus),
    // Add index for text search if you're using PostgreSQL's text search capabilities
    // titleSearchIdx: index("journeys_title_search_idx").using("gin")...
  })
);

// --- Journey Collaborators ---
export const journeyCollaborators = pgTable(
  "journey_collaborators",
  {
    journeyId: uuid("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: collaboratorRoleEnum("role").notNull(),
    status: collaboratorStatusEnum("status").default("pending").notNull(), // Schema 1 status field is good
    invitedAt: timestamp("invited_at", { withTimezone: true }).defaultNow().notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.journeyId, table.userId] }),
    journeyIdx: index("journey_collaborators_journey_idx").on(table.journeyId),
    userIdx: index("journey_collaborators_user_idx").on(table.userId),
  })
);

// --- Activities within a Journey ---
export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    journeyId: uuid("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(), // Made notNull based on Schema 2
    activityDate: date("activity_date").notNull(),
    dayNumber: integer("day_number"), // Optional explicit day number
    orderWithinDay: integer("order_within_day").default(0).notNull(),
    activityType: activityTypeEnum("activity_type"),
    content: text("content"), // Rich text / Markdown
    // Use 'real' for measurements (Schema 2)
    distanceKm: real("distance_km"),
    elevationGainM: real("elevation_gain_m"),
    elevationLossM: real("elevation_loss_m"), // Schema 1 included loss
    movingTimeSeconds: integer("moving_time_seconds"),
    startTime: timestamp("start_time", { withTimezone: true }),
    endTime: timestamp("end_time", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    journeyIdx: index("activities_journey_idx").on(table.journeyId),
    dateIdx: index("activities_date_idx").on(table.activityDate),
    orderIdx: index("activities_order_idx").on(
      table.journeyId,
      table.activityDate,
      table.orderWithinDay
    ),
    typeIdx: index("activities_type_idx").on(table.activityType),
    // Most common query pattern - activities for a journey ordered by date/order
    journeyDateOrderIdx: index("activities_journey_date_order_idx").on(
      table.journeyId,
      table.activityDate,
      table.orderWithinDay
    ),
    // Activities by type for a journey
    journeyTypeIdx: index("activities_journey_type_idx").on(table.journeyId, table.activityType),
    // For time-based queries
    startTimeIdx: index("activities_start_time_idx").on(table.startTime),
  })
);

// --- Media (Unified approach from Schema 2, but retain GPX table link) ---
export const media = pgTable(
  "media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    uploaderId: uuid("uploader_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Link EITHER to journey OR activity (Schema 2 flexibility)
    journeyId: uuid("journey_id").references(() => journeys.id, { onDelete: "cascade" }),
    activityId: uuid("activity_id").references(() => activities.id, { onDelete: "cascade" }),
    mediaType: mediaTypeEnum("media_type").notNull(),
    url: text("url").notNull(), // URL from storage
    filename: text("filename"),
    sizeBytes: integer("size_bytes"),
    mimeType: varchar("mime_type", { length: 100 }),
    metadata: jsonb("metadata"), // image dimensions, video duration, basic GPX stats, exif?
    order: integer("order").default(0), // Order within activity/journey gallery
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    uploaderIdx: index("media_uploader_idx").on(table.uploaderId),
    journeyIdx: index("media_journey_idx").on(table.journeyId), // Index even if nullable
    activityIdx: index("media_activity_idx").on(table.activityId), // Index even if nullable
    typeIdx: index("media_type_idx").on(table.mediaType),
    // Add composite indexes for faster queries on common patterns
    journeyTypeIdx: index("media_journey_type_idx").on(table.journeyId, table.mediaType),
    activityTypeIdx: index("media_activity_type_idx").on(table.activityId, table.mediaType),
    // Ensure media belongs to something
    checkTarget: check("media_target_check", sql`num_nonnulls(journey_id, activity_id) = 1`), // Ensure attached to exactly one context
  })
);

// --- GPX File Specific Details (Retained from Schema 1 for structure) ---
export const gpxFiles = pgTable(
  "gpx_files",
  {
    id: uuid("id").defaultRandom().primaryKey(), // Can potentially reuse mediaId if 1:1 enforced strictly
    mediaId: uuid("media_id")
      .notNull()
      .unique() // Ensure 1:1 with media entry of type 'gpx'
      .references(() => media.id, { onDelete: "cascade" }),
    activityId: uuid("activity_id") // Denormalized for direct activity link, ensure matches media.activityId
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    processedStats: jsonb("processed_stats"), // distance, elevation arrays, time stats etc.
    geoJsonData: jsonb("geo_json_data"), // Linestring/MultiLinestring for map rendering
    originalFilename: text("original_filename"),
    isMerged: boolean("is_merged").default(false),
    sourceGpxIds: uuid("source_gpx_ids").array(), // References other gpxFiles.id if merged
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // mediaId is already unique index via unique() constraint
    activityIdx: index("gpx_files_activity_idx").on(table.activityId),
  })
);

// --- Planning ---

// Planning Templates (Schema 2)
export const planningTemplates = pgTable(
  "planning_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    creatorId: uuid("creator_id") // Can be null for system templates
      .references(() => users.id, { onDelete: "set null" }),
    templateType: planningItemTypeEnum("template_type").notNull(), // 'checklist', 'gear_list', etc.
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    content: jsonb("content").notNull(), // The actual template structure (e.g., array of item definitions)
    isSystemTemplate: boolean("is_system_template").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    creatorTypeIdx: index("planning_templates_creator_type_idx").on(
      table.creatorId,
      table.templateType
    ),
    systemTypeIdx: index("planning_templates_system_type_idx").on(
      table.isSystemTemplate,
      table.templateType
    ),
  })
);

// Planning: Checklists (Hybrid: Structured table, JSONB items)
export const planningChecklists = pgTable(
  "planning_checklists",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    journeyId: uuid("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).default("Checklist").notNull(),
    // Flexible items using JSONB (Schema 2 approach)
    // Example item: { id: uuid(), text: 'Book flights', completed: false, notes: '...', assignedUserId: uuid() | null, order: 0 }
    items: jsonb("items").default("[]"),
    templateId: uuid("template_id").references(() => planningTemplates.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    journeyIdx: index("planning_checklists_journey_idx").on(table.journeyId),
  })
);

// Planning: Gear Lists (Hybrid: Structured table, JSONB items)
export const planningGearLists = pgTable(
  "planning_gear_lists",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    journeyId: uuid("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).default("Gear List").notNull(),
    // Flexible items using JSONB (Schema 2 approach)
    // Example item: { id: uuid(), name: 'Tent', weight: 2.5, unit: 'kg', quantity: 1, category: 'Shelter', packed: false, notes: '...', worn: false, consumable: false, assignedUserId: uuid() | null, order: 0 }
    items: jsonb("items").default("[]"),
    templateId: uuid("template_id").references(() => planningTemplates.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    journeyIdx: index("planning_gear_lists_journey_idx").on(table.journeyId),
  })
);

// Planning: Permits (Structured Table - Schema 1 approach)
export const planningPermits = pgTable(
  "planning_permits", // Renamed for consistency
  {
    id: uuid("id").defaultRandom().primaryKey(),
    journeyId: uuid("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(), // e.g., "National Park Entry", "Climbing Permit"
    referenceNumber: text("reference_number"),
    issuingAuthority: text("issuing_authority"), // Added
    link: text("link"),
    applicationDate: date("application_date"), // Added
    acquiredDate: date("acquired_date"),
    expiryDate: date("expiry_date"),
    status: planningItemStatusEnum("status").default("todo").notNull(),
    documentMediaId: uuid("document_media_id").references(() => media.id, { onDelete: "set null" }), // Link to uploaded media doc
    notes: text("notes"),
    cost: decimal("cost", { precision: 10, scale: 2 }), // Added
    currency: currencyEnum("currency"), // Using enum instead of varchar
    assignedUserId: uuid("assigned_user_id").references(() => users.id, { onDelete: "set null" }), // Added
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    journeyIdx: index("planning_permits_journey_idx").on(table.journeyId),
    statusIdx: index("planning_permits_status_idx").on(table.status),
    expiryDateIdx: index("planning_permits_expiry_date_idx").on(table.expiryDate),
  })
);

// Planning: Travel (Structured Table) - NEW based on planningItemType
export const planningTravel = pgTable(
  "planning_travel",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    journeyId: uuid("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    description: varchar("description", { length: 255 }).notNull(), // e.g., "Flight to Geneva", "Train to Chamonix"
    travelType: travelTypeEnum("travel_type").notNull(), // Using enum instead of varchar
    bookingReference: text("booking_reference"),
    provider: text("provider"), // e.g., "EasyJet", "SNCF"
    departureLocation: text("departure_location"),
    arrivalLocation: text("arrival_location"),
    departureDateTime: timestamp("departure_date_time", { withTimezone: true }),
    arrivalDateTime: timestamp("arrival_date_time", { withTimezone: true }),
    status: planningItemStatusEnum("status").default("todo").notNull(),
    documentMediaId: uuid("document_media_id").references(() => media.id, { onDelete: "set null" }), // Link to ticket/confirmation
    notes: text("notes"),
    cost: decimal("cost", { precision: 10, scale: 2 }),
    currency: currencyEnum("currency"), // Updated to use enum
    assignedUserId: uuid("assigned_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    journeyIdx: index("planning_travel_journey_idx").on(table.journeyId),
    typeIdx: index("planning_travel_type_idx").on(table.travelType),
    dateIdx: index("planning_travel_date_idx").on(table.departureDateTime),
    statusIdx: index("planning_travel_status_idx").on(table.status),
  })
);

// Planning: Contacts (Structured Table) - NEW based on planningItemType
export const planningContacts = pgTable(
  "planning_contacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    journeyId: uuid("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    contactType: contactTypeEnum("contact_type").notNull(),
    phoneNumber: text("phone_number"),
    email: text("email"),
    address: text("address"),
    website: text("website"),
    notes: text("notes"),
    isEmergencyContact: boolean("is_emergency_contact").default(false), // Highlight emergency contacts
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    journeyIdx: index("planning_contacts_journey_idx").on(table.journeyId),
    typeIdx: index("planning_contacts_type_idx").on(table.contactType),
  })
);

// Planning: Budget Items (Structured Table) - NEW based on planningItemType
export const planningBudgetItems = pgTable(
  "planning_budget_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    journeyId: uuid("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    description: varchar("description", { length: 255 }).notNull(),
    category: budgetCategoryEnum("category").notNull(), // Using enum instead of varchar
    estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
    actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
    currency: currencyEnum("currency").default("USD"), // Updated to use enum
    status: planningItemStatusEnum("status").default("todo").notNull(), // e.g., planned, paid, reimbursed
    dueDate: date("due_date"), // If payment needed by certain date
    paidDate: date("paid_date"),
    notes: text("notes"),
    assignedUserId: uuid("assigned_user_id").references(() => users.id, { onDelete: "set null" }), // Who is responsible?
    splitBetween: uuid("split_between").array(), // Array of userIds if cost is split
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    journeyIdx: index("planning_budget_items_journey_idx").on(table.journeyId),
    categoryIdx: index("planning_budget_items_category_idx").on(table.category),
    statusIdx: index("planning_budget_items_status_idx").on(table.status),
    dueDateIdx: index("planning_budget_items_due_date_idx").on(table.dueDate),
  })
);

// --- Social Features ---

// Comments (Schema 1 check constraint, Schema 2 naming/relations)
export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Comment can be on Journey OR Activity
    journeyId: uuid("journey_id").references(() => journeys.id, { onDelete: "cascade" }),
    activityId: uuid("activity_id").references(() => activities.id, { onDelete: "cascade" }),
    parentCommentId: uuid("parent_comment_id").references(() => comments.id, {
      onDelete: "cascade",
    }), // Use Schema 2 name
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdx: index("comments_user_idx").on(table.userId),
    journeyIdx: index("comments_journey_idx").on(table.journeyId),
    activityIdx: index("comments_activity_idx").on(table.activityId),
    parentCommentIdx: index("comments_parent_comment_idx").on(table.parentCommentId),
    // Schema 1 check constraint logic is slightly more robust for replies
    checkTarget: check(
      "comments_target_check",
      sql`(CASE WHEN parent_comment_id IS NULL THEN num_nonnulls(journey_id, activity_id) = 1 ELSE TRUE END)`
    ),
  })
);

// Bookmarks (User <-> Journey)
export const bookmarks = pgTable(
  "bookmarks",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    journeyId: uuid("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.journeyId] }),
    journeyIdx: index("bookmarks_journey_idx").on(table.journeyId), // Index user too if needed for "journeys bookmarked by user"
    userIdx: index("bookmarks_user_idx").on(table.userId),
  })
);

// Follows (User <-> User)
export const follows = pgTable(
  "follows",
  {
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // User doing the following
    followingId: uuid("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // User being followed
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.followerId, table.followingId] }),
    followingIdx: index("follows_following_idx").on(table.followingId), // Find followers of a user
    followerIdx: index("follows_follower_idx").on(table.followerId), // Find users someone follows
  })
);

// Notifications (Schema 2)
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recipientId: uuid("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }), // User causing the notification
    notificationType: notificationTypeEnum("notification_type").notNull(),
    entityId: uuid("entity_id"), // ID of related Journey, Comment, User, etc.
    entityType: entityTypeEnum("entity_type"), // Using enum instead of text
    contentPreview: text("content_preview"), // e.g., "started following you", "commented: ..."
    read: boolean("read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    recipientIdx: index("notifications_recipient_idx").on(table.recipientId),
    recipientReadIdx: index("notifications_recipient_read_idx").on(table.recipientId, table.read),
    typeIdx: index("notifications_type_idx").on(table.notificationType),
    // Add created at index for chronological queries
    createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
    // Combined index for common query patterns
    recipientTypeIdx: index("notifications_recipient_type_idx").on(
      table.recipientId,
      table.notificationType
    ),
  })
);

// --- Analytics / Tracking (Simple version from Schema 1) ---
export const journeyViews = pgTable(
  "journey_views",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    journeyId: uuid("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }), // Null for anonymous
    ipAddress: text("ip_address"), // Consider anonymization/hashing
    userAgent: text("user_agent"),
    viewedAt: timestamp("viewed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    journeyIdx: index("journey_views_journey_idx").on(table.journeyId),
    userIdx: index("journey_views_user_idx").on(table.userId),
    timeIdx: index("journey_views_time_idx").on(table.viewedAt),
  })
);

// ---------- RELATIONS (Refined & Expanded) ----------

export const usersRelations = relations(users, ({ one, many }) => ({
  athleteProfile: one(athleteProfiles, {
    fields: [users.id],
    references: [athleteProfiles.userId],
  }),
  athleteSports: many(athleteSports), // Link to chosen sports
  createdJourneys: many(journeys, { relationName: "createdJourneys" }),
  collaborations: many(journeyCollaborators),
  uploadedMedia: many(media, { relationName: "uploadedMedia" }),
  comments: many(comments),
  bookmarks: many(bookmarks),
  following: many(follows, { relationName: "userIsFollowing" }), // People this user follows
  followers: many(follows, { relationName: "userIsFollowedBy" }), // People following this user
  journeyViews: many(journeyViews),
  assignedPermits: many(planningPermits), // Planning assignments
  assignedTravel: many(planningTravel),
  assignedBudgetItems: many(planningBudgetItems),
  createdPlanningTemplates: many(planningTemplates),
  notificationsReceived: many(notifications, { relationName: "notificationsForUser" }),
  notificationsSent: many(notifications, { relationName: "notificationsByUser" }), // If tracking actor
}));

export const athleteProfilesRelations = relations(athleteProfiles, ({ one }) => ({
  user: one(users, { fields: [athleteProfiles.userId], references: [users.id] }),
}));

export const athleteSportsRelations = relations(athleteSports, ({ one }) => ({
  user: one(users, { fields: [athleteSports.userId], references: [users.id] }),
  // If sports were a table: sportDetails: one(sportsTable, { fields: [athleteSports.sport], references: [sportsTable.key]})
}));

export const journeysRelations = relations(journeys, ({ one, many }) => ({
  creator: one(users, {
    fields: [journeys.creatorId],
    references: [users.id],
    relationName: "createdJourneys",
  }),
  activities: many(activities),
  collaborators: many(journeyCollaborators),
  media: many(media, { relationName: "journeyMedia" }), // Media directly attached to journey
  comments: many(comments), // Top-level comments on the journey
  bookmarks: many(bookmarks),
  views: many(journeyViews),
  // Planning Sections
  planningChecklists: many(planningChecklists),
  planningGearLists: many(planningGearLists),
  planningPermits: many(planningPermits),
  planningTravel: many(planningTravel),
  planningContacts: many(planningContacts),
  planningBudgetItems: many(planningBudgetItems),
}));

export const journeyCollaboratorsRelations = relations(journeyCollaborators, ({ one }) => ({
  journey: one(journeys, { fields: [journeyCollaborators.journeyId], references: [journeys.id] }),
  user: one(users, { fields: [journeyCollaborators.userId], references: [users.id] }),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  journey: one(journeys, { fields: [activities.journeyId], references: [journeys.id] }),
  media: many(media, { relationName: "activityMedia" }), // Media attached to this activity
  gpxFiles: many(gpxFiles), // Direct access to GPX data linked to this activity
  comments: many(comments), // Comments specifically on this activity
}));

export const mediaRelations = relations(media, ({ one }) => ({
  uploader: one(users, {
    fields: [media.uploaderId],
    references: [users.id],
    relationName: "uploadedMedia",
  }),
  journey: one(journeys, {
    fields: [media.journeyId],
    references: [journeys.id],
    relationName: "journeyMedia",
  }),
  activity: one(activities, {
    fields: [media.activityId],
    references: [activities.id],
    relationName: "activityMedia",
  }),
  gpxFile: one(gpxFiles, { fields: [media.id], references: [gpxFiles.mediaId] }), // Link to specific GPX details
  permitDocument: one(planningPermits, {
    fields: [media.id],
    references: [planningPermits.documentMediaId],
  }), // If used as permit doc
  travelDocument: one(planningTravel, {
    fields: [media.id],
    references: [planningTravel.documentMediaId],
  }), // If used as travel doc
}));

export const gpxFilesRelations = relations(gpxFiles, ({ one }) => ({
  media: one(media, { fields: [gpxFiles.mediaId], references: [media.id] }),
  activity: one(activities, { fields: [gpxFiles.activityId], references: [activities.id] }),
}));

// --- Planning Relations ---
export const planningTemplatesRelations = relations(planningTemplates, ({ one }) => ({
  creator: one(users, { fields: [planningTemplates.creatorId], references: [users.id] }),
}));

export const planningChecklistsRelations = relations(planningChecklists, ({ one }) => ({
  journey: one(journeys, { fields: [planningChecklists.journeyId], references: [journeys.id] }),
  template: one(planningTemplates, {
    fields: [planningChecklists.templateId],
    references: [planningTemplates.id],
  }),
}));

export const planningGearListsRelations = relations(planningGearLists, ({ one }) => ({
  journey: one(journeys, { fields: [planningGearLists.journeyId], references: [journeys.id] }),
  template: one(planningTemplates, {
    fields: [planningGearLists.templateId],
    references: [planningTemplates.id],
  }),
}));

export const planningPermitsRelations = relations(planningPermits, ({ one }) => ({
  journey: one(journeys, { fields: [planningPermits.journeyId], references: [journeys.id] }),
  assignedUser: one(users, { fields: [planningPermits.assignedUserId], references: [users.id] }),
  documentMedia: one(media, { fields: [planningPermits.documentMediaId], references: [media.id] }),
}));

export const planningTravelRelations = relations(planningTravel, ({ one }) => ({
  journey: one(journeys, { fields: [planningTravel.journeyId], references: [journeys.id] }),
  assignedUser: one(users, { fields: [planningTravel.assignedUserId], references: [users.id] }),
  documentMedia: one(media, { fields: [planningTravel.documentMediaId], references: [media.id] }),
}));

export const planningContactsRelations = relations(planningContacts, ({ one }) => ({
  journey: one(journeys, { fields: [planningContacts.journeyId], references: [journeys.id] }),
}));

export const planningBudgetItemsRelations = relations(planningBudgetItems, ({ one }) => ({
  journey: one(journeys, { fields: [planningBudgetItems.journeyId], references: [journeys.id] }),
  assignedUser: one(users, {
    fields: [planningBudgetItems.assignedUserId],
    references: [users.id],
  }),
  // Relation for splitBetween user IDs would likely be handled in application logic
}));

// --- Social Relations ---
export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  journey: one(journeys, { fields: [comments.journeyId], references: [journeys.id] }),
  activity: one(activities, { fields: [comments.activityId], references: [activities.id] }),
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: "commentReplies",
  }),
  replies: many(comments, { relationName: "commentReplies" }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
  journey: one(journeys, { fields: [bookmarks.journeyId], references: [journeys.id] }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "userIsFollowing",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "userIsFollowedBy",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.recipientId],
    references: [users.id],
    relationName: "notificationsForUser",
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
    relationName: "notificationsByUser",
  }),
  // Dynamic links to entityId would be app logic
}));

// --- Analytics Relations ---
export const journeyViewsRelations = relations(journeyViews, ({ one }) => ({
  journey: one(journeys, { fields: [journeyViews.journeyId], references: [journeys.id] }),
  user: one(users, { fields: [journeyViews.userId], references: [users.id] }),
}));
