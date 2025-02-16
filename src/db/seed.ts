import { createClient } from '@libsql/client'
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import { reset, seed } from 'drizzle-seed'
import { participant } from './schema'

async function main() {
	const dbUrl = process.env.DB_URL
	if (!dbUrl) {
		throw new Error('Missing environment variable: DB_URL')
	}
	const queryClient = createClient({ url: dbUrl })
	const db = drizzle(queryClient)

	const SEED = 1234

	await seed(db, { participant }, { seed: SEED }).refine((f) => {
		return {
			participant: {
				count: 20,
				columns: {
					firstName: f.firstName(),
					lastName: f.lastName(),
					email: f.email(),
					attendanceStatus: f.valuesFromArray({ values: ['registered', 'confirmed', 'waitlist'] }),
					createdAt: f.default({ defaultValue: new Date().toISOString() }),
					phone: f.phoneNumber({ template: '###-###-####' }),
					age: f.int({ minValue: 16, maxValue: 25 }),
					graduationYear: f.int({ minValue: 2015, maxValue: 2025 }),
					levelOfStudy: f.valuesFromArray({ values: ['undergraduate', 'graduate', 'phd', 'highschool'] }),
					gender: f.valuesFromArray({ values: ['male', 'female', 'nonbinary', 'other', 'noanswer'] }),
					school: f.valuesFromArray({ values: ['University of Cincinnati', 'Hardvard University', 'Dartmouth College'] }),
					country: f.country(),
					major: f.default({ defaultValue: 'Computer Science' }),
					dietRestrictions: f.valuesFromArray({ values: ['none', '', 'vegan'] }),
					resumeUrl: f.default({ defaultValue: null }),
					notes: f.default({ defaultValue: null }),
					updatedAt: f.default({ defaultValue: null }),
					deletedAt: f.default({ defaultValue: null }),
					checkedInAt: f.default({ defaultValue: null })
				}
			}
		}
	})

	console.log('Seed done')
	queryClient.close()
}

main()
