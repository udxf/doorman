import close from './close.js'
import { ApplicationCommandType } from 'discord.js'

export default {
  data: {
    type: ApplicationCommandType.User,
    name: 'Close for User',
  },
  execute: close.execute
}
