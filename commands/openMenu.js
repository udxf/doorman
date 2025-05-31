/** @type {import('discord.js').ApplicationCommand} */
module.exports = {
  type: 2,
  name: 'Open for User',
  execute: require('./open').execute
}
