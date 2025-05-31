const { hubs, history, session } = require('../util/database')

/**
 * @param {import('discord.js').Guild} guild Deleted guild instance
 * @this import('discord.js').Client
 */
module.exports = async function(guild) {
  hubs.delete({ guild: guild.id })
  history.delete({ guild: guild.id })
  session.delete({ guild: guild.id })
}
