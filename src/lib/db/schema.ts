/**
 * Relational Database Schema for Yatrion
 * Implemented using Drizzle ORM (SQLite / LibSQL dialect)
 */

import { sqliteTable, text, integer, index, unique } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    lastLoginAt: text("last_login_at").notNull(),
  },
  (table) => [
    index("idx_users_email").on(table.email),
  ]
);

export const trips = sqliteTable(
  "trips",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    destinationIdsJson: text("destination_ids_json").notNull(),
    preferencesJson: text("preferences_json").notNull(),
    itineraryJson: text("itinerary_json").notNull(),
    routeJson: text("route_json"),
    budgetJson: text("budget_json"),
    groupStateJson: text("group_state_json"),
    dayNotesJson: text("day_notes_json"),
    stopNotesJson: text("stop_notes_json"),
    completedStopsJson: text("completed_stops_json"),
    savedGemIdsJson: text("saved_gem_ids_json"),
    version: integer("version").notNull().default(1),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_trips_user_id").on(table.userId),
  ]
);

export const savedPlaces = sqliteTable(
  "saved_places",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    placeId: text("place_id").notNull(),
    notes: text("notes"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_saved_places_user_id").on(table.userId),
    unique("unq_user_place").on(table.userId, table.placeId),
  ]
);

export type UserRow = typeof users.$inferSelect;
export type InsertUserRow = typeof users.$inferInsert;

export type TripRow = typeof trips.$inferSelect;
export type InsertTripRow = typeof trips.$inferInsert;

export type SavedPlaceRow = typeof savedPlaces.$inferSelect;
export type InsertSavedPlaceRow = typeof savedPlaces.$inferInsert;

