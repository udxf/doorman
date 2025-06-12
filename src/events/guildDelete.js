import { hubs, history, session } from '../util/database.js'

/**
 * @param {import('discord.js').Guild} guild Deleted guild instance
 * @this import('discord.js').Client
 */
export default async function(guild) {
  hubs.delete({ guild: guild.id })
  history.delete({ guild: guild.id })
  session.delete({ guild: guild.id })
}
