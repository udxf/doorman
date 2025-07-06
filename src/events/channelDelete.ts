import { hubs, session, history } from '../util/database.js'
import type { Client, DMChannel, NonThreadGuildBasedChannel } from 'discord.js'

export default async function(
  this: Client<true>,
  channel: DMChannel | NonThreadGuildBasedChannel
): Promise<void> {
  hubs.delete(channel.id)
  session.delete(channel.id)
  history.delete({ hub: channel.id })
}

// TODO: delete hubs/history or sessions conditionally.
