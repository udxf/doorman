import { history, session } from '../util/database.js'
import { Role, InteractionContextType, MessageFlags } from 'discord.js'

/** @type {import('discord.js').ApplicationCommand} */
export default {
  name: 'close',
  description: 'Prevent others from joining the channel',
  contexts: [InteractionContextType.Guild],

  options: [{
    type: 9, // mentionable
    name: 'for',
    description: "User or role you don't want to be able to join the channel"
  }],

  /** @this {import('discord.js').Interaction} */
  async execute(target = this.guild.roles.everyone) {

    if (target == this.member)
      return this.reply({
        flags: MessageFlags.Ephemeral,
        content: `You can't affect your own permissions.`
      })

    if (target == this.guild.members.me)
      return this.reply({
        flags: MessageFlags.Ephemeral,
        content: `You can't restrict me. It's required for me to have access to all personal voice channels to function properly.`
      })

    if (target.permissions?.has(0x8n))
      return this.reply({
        flags: MessageFlags.Ephemeral,
        content: `${target} has admin rights. Administrators always have full access to all channels.`
      })

    const channel = this.member.voice.channel
    const { hub, host } = Object(await session.get(channel?.id))

    if (!channel || host != this.user.id)
      return this.reply({
        flags: MessageFlags.Ephemeral,
        content: 'You have to be in your own voice channel in order to use this command.'
      })

    history.set({ hub, user: this.user.id }, {
      [`permissions.${target.id}`]: {
        type: target instanceof Role ? 0 : 1,
        deny: 0x400
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
