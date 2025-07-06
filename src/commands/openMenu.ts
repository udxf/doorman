import open from './open.js'
import { ApplicationCommandType } from 'discord.js'

export default {
  type: ApplicationCommandType.User,
  name: 'Open for User',
  execute: open.execute
}
