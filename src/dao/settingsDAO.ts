import { eq } from 'drizzle-orm'
import { settingsTable } from '@/db/schema'
import { db } from '@/utils/db'

// Return Types
const SettingsResponse = {
  timezone: settingsTable.timezone,
  userId: settingsTable.userId,
}

// Filter Conditions
const UserIdEqualTo = (userId: string) => eq(settingsTable.userId, userId)

const getUserTimezone = async (userId: string) => {
  const settingsResult = await db
    .select(SettingsResponse)
    .from(settingsTable)
    .where(UserIdEqualTo(userId))

  if (settingsResult.length === 0) {
    return 'UTC'
  }

  return settingsResult[0].timezone
}

const getUserTimezoneAndCreateIfNull = async (
  userId: string,
  timezone: string
): Promise<string> => {
  const settingsResult = await db
    .select(SettingsResponse)
    .from(settingsTable)
    .where(UserIdEqualTo(userId))

  if (settingsResult.length === 0) {
    await db.insert(settingsTable).values({
      userId,
      timezone,
    })
    return timezone
  }

  return settingsResult[0].timezone
}

const settingsDAO = {
  getUserTimezone,
  getUserTimezoneAndCreateIfNull,
}

export default settingsDAO
