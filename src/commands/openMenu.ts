import open from './open.js'
import { ApplicationCommandType } from 'discord.js'

export default {
  data: {
    type: ApplicationCommandType.User,
    name: 'Open for User',
  },
  execute: open.execute
}
