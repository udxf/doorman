import open from './open.js'

/** @type {import('discord.js').ApplicationCommand} */
export default {
  type: 2,
  name: 'Open for User',
  execute: open.execute
}
