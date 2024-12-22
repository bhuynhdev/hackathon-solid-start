import { sql, type SQL } from "drizzle-orm";
import { sqliteTable, text, integer, check } from "drizzle-orm/sqlite-core";

export const event = sqliteTable(
  "event",
  {
    id: integer("id").primaryKey(),
    timestamp: text("timestamp").notNull(),
    description: text("description").notNull(),
    performedBy: integer("performed_by").references(() => participant.id),
    targetParticipantId: integer("target_participant_id").references(
      () => participant.id,
    ),
    targetUserId: integer("target_user_id").references(() => user.id),
    extraInfo: text("extra_info", { mode: "json" }),
  },
  (table) => ({
    // Only one target is allowed, either targetParticipant or targetUser. One of them must be null, and one of them must not null
    check: check(
      "only_one_target",
      sql`(${table.targetParticipantId} IS NOT NULL and ${table.targetUserId} IS NULL)
          OR (${table.targetParticipantId} IS NULL and ${table.targetUserId} IS NOT NULL)`,
    ),
  }),
);

export const participant = sqliteTable("participant", {
  id: integer("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  checkedIn: integer("checked_in", { mode: "boolean" })
    .default(false)
    .notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  age: integer("age"),
  gender: text("gender", {
    enum: ["male", "female", "nonbinary", "other", "noanswer"],
  }),
  school: text("school"),
  graduationYear: integer("graduation_year"),
  levelOfStudy: text("level_of_study"),
  country: text("country"),
  major: text("major"),
  dietRestrictions: text("diet_restrictions"),
  resumeUrl: text("resume_url"),
  notes: text("notes"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
  nameEmail: text("name_email")
    .notNull()
    .generatedAlwaysAs(
      (): SQL =>
        sql`lower(${participant.firstName} || ' ' || ${participant.lastName} || ' ' || ${participant.email})`,
    ),
});

export const user = sqliteTable("user", {
  id: integer("id").primaryKey(),
  email: text("email").notNull(),
  password: text("password"),
  name: text("name").notNull(),
  isAdmin: integer("is_admin", { mode: "boolean" }).default(false).notNull(),
  isJudge: integer("is_judge", { mode: "boolean" }).default(false).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => participant.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export type Session = typeof session.$inferSelect;
export type Participant = typeof participant.$inferSelect;
export type User = typeof user.$inferSelect;
