import { eq, sql } from 'drizzle-orm'
import { settingsTable } from '@/db/schema'
import { db } from '@/utils/db'

// Return Types
const SettingsResponse = {
  timezone: settingsTable.timezone,
  userId: settingsTable.userId,
  imageEndpointCount: settingsTable.imageEndpointCount,
  imageEndpointEnabled: settingsTable.imageEndpointEnabled,
}

// Filter Conditions
const UserIdEqualTo = (userId: string) => eq(settingsTable.userId, userId)

const getUserImageEndpointEnabled = async (userId: string) => {
  const settingsResult = await db
    .select(SettingsResponse)
    .from(settingsTable)
    .where(UserIdEqualTo(userId))

  if (settingsResult.length === 0) {
    return false
  }

  return settingsResult[0].imageEndpointCount
}

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

const increaseUserImageEndpointCount = async (
  userId: string,
  tokenUsage: number
) => {
  const settings = await db
    .update(settingsTable)
    .set({
      imageEndpointCount: sql`${settingsTable.imageEndpointCount} + 1`,
      imageEndpointInputTokenUsage: sql`${settingsTable.imageEndpointInputTokenUsage} + ${tokenUsage}`,
    })
    .where(UserIdEqualTo(userId))
    .returning()

  return settings[0]
}

const settingsDAO = {
  getUserImageEndpointEnabled,
  getUserTimezone,
  getUserTimezoneAndCreateIfNull,
  increaseUserImageEndpointCount,
}

export default settingsDAO
