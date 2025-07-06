import close from './close.js'
import { ApplicationCommandType } from 'discord.js'

export default {
  type: ApplicationCommandType.User,
  name: 'Close for User',
  execute: close.execute
}
