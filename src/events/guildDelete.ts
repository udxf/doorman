import { hubs, history, session } from '../util/database.js'
import type { Client, Guild } from 'discord.js'

export default async function(this: Client<true>, guild: Guild): Promise<void> {
  hubs.delete({ guild: guild.id })
  history.delete({ guild: guild.id })
  session.delete({ guild: guild.id })
}
