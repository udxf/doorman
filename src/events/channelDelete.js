import { hubs, session, history } from '../util/database.js'

/**
 * @param {import('discord.js').NonThreadGuildBasedChannel} channel Deleted channel instance
 * @this import('discord.js').Client
 */
export default async function(channel) {
  hubs.delete(channel.id)
  session.delete(channel.id)
  history.delete({ hub: channel.id })
}

// TODO: delete hubs/history or sessions conditionally.
