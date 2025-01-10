import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import { event, participant } from './schema'
import 'dotenv/config'

async function main() {
	const dbUrl = process.env.DB_URL
	if (!dbUrl) {
		throw new Error('Missing environment variable: DB_URL')
	}
	const queryClient = createClient({ url: dbUrl })
	const db = drizzle(queryClient)

	/**
	 * SEED REGISTRY
	 **/

	type NewParticipant = typeof participant.$inferInsert
	const participantSeeds: Array<NewParticipant> = [
		{
			firstName: 'Steve',
			lastName: 'Job',
			email: 'steve.job@email.com',
			checkedIn: true
		},
		{ firstName: 'Andrej', lastName: 'Karpathy', email: 'ak@email.com' },
		{
			firstName: 'Sundar',
			lastName: 'Pichai',
			email: 'pichai123@email.com'
		},
		{
			firstName: 'Hans',
			lastName: 'Zimmer',
			email: 'zimmerhans@email.com'
		},
		{ firstName: 'Dan', lastName: 'Abramov', email: 'dan-react@email.com' }
	]

	console.log('Registry Seed start')
	for (const participantSeed of participantSeeds) {
		await db.transaction(async (tx) => {
			const [newParticipant] = await tx.insert(participant).values(participantSeed).returning()
			if (!newParticipant) throw Error('Cannot create registry record')
			// Insert corresponding event
			await tx.insert(event).values([
				{
					targetParticipantId: newParticipant.id,
					timestamp: new Date().toISOString(),
					description: 'Seed register participant'
				}
			])
		})
	}

	console.log('Registry Seed done')
	queryClient.close()
}

main()
