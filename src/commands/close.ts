import { history, session } from '../util/database.js'
import {
  InteractionContextType,
  ApplicationCommandOptionType as OptionType,
  MessageFlags,
  PermissionFlagsBits,
  Role,
  type ChatInputCommandInteraction,
  type GuildMember,
} from 'discord.js'

export default {
  data: {
    name: 'close',
    description: 'Prevent others from joining the channel',
    contexts: [InteractionContextType.Guild],

    options: [{
      type: OptionType.Mentionable,
      name: 'for',
      description: "User or role you don't want to be able to join the channel"
    }],
  },

  async execute(
    this: ChatInputCommandInteraction<'cached'>,
    target: GuildMember | Role = this.guild.roles.everyone
  ): Promise<void> {

    // Make sure target is not the invoker
    if (target === this.member) {
      this.reply({
        flags: MessageFlags.Ephemeral,
        content: `You can't affect your own permissions.`
      })

      return
    }
    // Make sure target is not the bot
    else if (target === this.guild.members.me) {
      this.reply({
        flags: MessageFlags.Ephemeral,
        content: `You can't restrict me. It's required for me to have access to all personal voice channels to function properly.`
      })

      return
    }
    // Make sure target is not administrator
    else if (target.permissions.has(PermissionFlagsBits.Administrator)) {
      this.reply({
        flags: MessageFlags.Ephemeral,
        content: `${target} has admin rights. Administrators always have full access to all channels.`
      })

      return
    }

    const voiceState = await this.guild.voiceStates.fetch(this.user.id)
    const channel = voiceState.channel
    const { hub, host } = Object(channel && await session.get(channel.id))

    if (!channel || host !== this.user.id) {
      this.reply({
        flags: MessageFlags.Ephemeral,
        content: 'You have to be in your own voice channel in order to use this command.'
      })

      return
    }

    history.set({ hub, user: this.user.id }, {
      permissions: {
        [target.id]: {
          type: target instanceof Role ? 0 : 1,
          deny: 0x400n
        }
      }
    })

    this.reply({
      flags: MessageFlags.Ephemeral,
      content: `Now ${target == this.guild.roles.everyone ? 'nobody, except those whom you gave permission,' : target} can't join ${channel} and send messages there.`
    })

    channel.permissionOverwrites.edit(target, {
      ViewChannel: false
    })
  }
}
