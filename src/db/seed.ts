import assert from 'assert'
import { drizzle } from 'drizzle-orm/libsql'
import { reset, seed } from 'drizzle-seed'
import { getLocalD1Path } from '../../drizzle.config'
import { participant } from './schema'

async function main() {
	assert(process.env.NODE_ENV == 'development', 'Can only seed in development mode')
	const localD1DbUrl = getLocalD1Path('DB')
	const db = drizzle(`file:${localD1DbUrl}`)

	const SEED = 1234

	await reset(db, { participant })
	await seed(db, { participant }, { seed: SEED }).refine((f) => {
		return {
			participant: {
				count: 50,
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
					checkedInAt: f.default({ defaultValue: null }),
					lastConfirmedAttendanceAt: f.default({ defaultValue: null })
				}
			}
		}
	})

	console.log('Seed done')
	process.exit(0)
}

main()
