import { history, session } from '../util/database.js'
import { Role } from 'discord.js'

/** @type {import('discord.js').ApplicationCommand} */
export default {
  name: 'open',
  description: 'Allow others to join the channel',
  dmPermission: false,

  options: [{
    type: 9, // mentionable
    name: 'for',
    description: "User or role you want to be able to join the channel"
  }],

  /** @this {import('discord.js').Interaction} */
  async execute(target = this.guild.roles.everyone) {

    if (target == this.member)
      return this.reply({
        ephemeral: true,
        content: `You can't affect your own permissions.`
      })

    if (target == this.guild.members.me)
      return this.reply({
        ephemeral: true,
        content: `I should already have required permissions.`
      })

    if (target.permissions?.has(0x8n))
      return this.reply({
        ephemeral: true,
        content: `${target} has admin rights. Administrators always have full access to all channels.`
      })

    const channel = this.member.voice.channel
    const { hub, host } = Object(await session.get(channel?.id))

    if (!channel || host != this.user.id)
      return this.reply({
        ephemeral: true,
        content: 'You have to be in your own voice channel in order to use this command.'
      })

    history.set({ hub, user: this.user.id }, {
      [`permissions.${target.id}`]: {
        type: target instanceof Role ? 0 : 1,
        allow: 0x400
      }
    })

    this.reply({
      ephemeral: true,
      content: `Now ${target} is able to access ${channel}.`
    })

    channel.permissionOverwrites.edit(target, {
      ViewChannel: true
    })
  }
}
