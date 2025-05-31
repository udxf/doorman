const { hubs, session, history } = require('../util/database')

/**
 * @param {import('discord.js').NonThreadGuildBasedChannel} channel Deleted channel instance
 * @this import('discord.js').Client
 */
module.exports = async function(channel) {
  hubs.delete(channel.id)
  session.delete(channel.id)
  history.delete({ hub: channel.id })
}

// TODO: delete hubs/history or sessions conditionally.
