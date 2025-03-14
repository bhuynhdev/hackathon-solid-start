import { sql, type SQL } from 'drizzle-orm'
import { sqliteTable, text, integer, check } from 'drizzle-orm/sqlite-core'

export const event = sqliteTable(
	'event',
	{
		id: integer('id').primaryKey(),
		timestamp: text('timestamp').notNull(),
		description: text('description').notNull(),
		performedBy: integer('performed_by').references(() => participant.id),
		targetParticipantId: integer('target_participant_id').references(() => participant.id),
		targetUserId: integer('target_user_id').references(() => user.id),
		extraInfo: text('extra_info', { mode: 'json' })
	},
	(table) => [
		// Only one target is allowed, either targetParticipant or targetUser. One of them must be null, and one of them must NOT null
		check(
			'only_one_target',
			sql`(${table.targetParticipantId} IS NOT NULL and ${table.targetUserId} IS NULL)
          OR (${table.targetParticipantId} IS NULL and ${table.targetUserId} IS NOT NULL)`
		)
	]
)

export const attendanceStatuses = [
	'registered',
	'declined',
	'confirmed',
	'confirmeddelayedcheckin',
	'attended',
	'waitlist',
	'waitlistattended'
] as const

export const participant = sqliteTable('participant', {
	id: integer('id').primaryKey(),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	attendanceStatus: text('attendance_status', { enum: attendanceStatuses }).default('registered').notNull(),
	email: text('email').notNull(),
	phone: text('phone').notNull(),
	age: integer('age').notNull(),
	gender: text('gender', { enum: ['male', 'female', 'nonbinary', 'other', 'noanswer'] }).notNull(),
	school: text('school').notNull(),
	graduationYear: integer('graduation_year').notNull(),
	levelOfStudy: text('level_of_study').notNull(),
	country: text('country').notNull(),
	major: text('major').notNull(),
	dietRestrictions: text('diet_restrictions').default('').notNull(),
	resumeUrl: text('resume_url'),
	notes: text('notes'),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at'),
	deletedAt: text('deleted_at'),
	lastConfirmedAttendanceAt: text('last_confirmed_attendance_at'),
	checkedInAt: text('checkedin_at'),
	nameEmail: text('name_email')
		.notNull()
		.generatedAlwaysAs((): SQL => sql`lower(${participant.firstName} || ' ' || ${participant.lastName} || ' ' || ${participant.email})`)
})

export const user = sqliteTable('user', {
	id: integer('id').primaryKey(),
	email: text('email').notNull(),
	password: text('password'),
	name: text('name').notNull(),
	isDiabled: integer('is_disabled', { mode: 'boolean' }).default(false).notNull(),
	isAdmin: integer('is_admin', { mode: 'boolean' }).default(false).notNull(),
	isJudge: integer('is_judge', { mode: 'boolean' }).default(false).notNull()
})

export const category = sqliteTable('category', {
	id: integer('id').primaryKey(),
	name: text('name').unique().notNull(),
	type: text('type', { enum: ['sponsor', 'inhouse', 'general'] }).notNull()
})

export const judge = sqliteTable('judge', {
	id: integer('id').primaryKey(),
	email: text('email').unique().notNull(),
	name: text('name').notNull(),
	categoryId: integer('category_id').references(() => category.id).notNull()
})

export const mailCampaign = sqliteTable('mail_campaign', {
	id: integer('id').primaryKey(),
	template: text('template').notNull(),
	createdAt: text('created_at').notNull(),
	recipientCount: integer('recipient_count').notNull()
})

export const mailLog = sqliteTable('mail_log', {
	id: integer('id').primaryKey(),
	mailCampaignId: integer('mail_campaign_id')
		.references(() => mailCampaign.id)
		.notNull(),
	recipientId: integer('recipient_id')
		.references(() => participant.id)
		.notNull(),
	createdAt: text('created_at').notNull(),
	status: text('status', { enum: ['new', 'failed', 'success'] })
		.default('new')
		.notNull()
})

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => participant.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
})

export type Session = typeof session.$inferSelect

export type Participant = typeof participant.$inferSelect
export type ParticipantInsert = typeof participant.$inferSelect
export type ParticipantUpdate = Partial<ParticipantInsert>
export type AttendanceStatus = (typeof attendanceStatuses)[number]

export type Category = typeof category.$inferSelect
export type NewCategory = typeof category.$inferInsert

export type MailCampaign = typeof mailCampaign.$inferSelect
export type MailCampaignInsert = typeof mailCampaign.$inferInsert

export type MailLog = typeof mailLog.$inferSelect
export type MailLogInsert = typeof mailLog.$inferInsert

export type User = typeof user.$inferSelect

export type Judge = typeof judge.$inferSelect
export type NewJudge = typeof judge.$inferInsert