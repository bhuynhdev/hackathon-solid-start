import type { BuildQueryResult, DBQueryConfig, ExtractTablesWithRelations } from 'drizzle-orm'
import * as schema from './schema'

// Infering table model with relations
// Credit: https://github.com/drizzle-team/drizzle-orm/issues/695#issuecomment-1881454650
type Schema = typeof schema
type TSchema = ExtractTablesWithRelations<Schema>

export type IncludeRelation<TableName extends keyof TSchema> = DBQueryConfig<'one' | 'many', boolean, TSchema, TSchema[TableName]>['with']

export type InferResultType<TableName extends keyof TSchema, With extends IncludeRelation<TableName> | undefined = undefined> = BuildQueryResult<
	TSchema,
	TSchema[TableName],
	{
		with: With
	}
>

export type Session = typeof schema.session.$inferSelect

export type Participant = typeof schema.participant.$inferSelect
export type ParticipantInsert = typeof schema.participant.$inferSelect
export type ParticipantUpdate = Partial<ParticipantInsert>
export type AttendanceStatus = (typeof schema.attendanceStatuses)[number]

export type Category = typeof schema.category.$inferSelect
export type NewCategory = typeof schema.category.$inferInsert
export type CategoryType = Category['type']

export type MailCampaign = typeof schema.mailCampaign.$inferSelect
export type MailCampaignInsert = typeof schema.mailCampaign.$inferInsert

export type MailLog = typeof schema.mailLog.$inferSelect
export type MailLogInsert = typeof schema.mailLog.$inferInsert

export type User = typeof schema.user.$inferSelect

export type Judge = typeof schema.judge.$inferSelect
export type NewJudge = typeof schema.judge.$inferInsert

export type Project = typeof schema.project.$inferSelect
export type ProjectWithSubmission = InferResultType<'project', { submissions: true }>
export type NewProject = typeof schema.project.$inferInsert
