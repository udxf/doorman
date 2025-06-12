import close from './close.js'

/** @type {import('discord.js').ApplicationCommand} */
export default {
  type: 2,
  name: 'Close for User',
  execute: close.execute
}
