import { roleMention, userMention, EmbedBuilder } from 'discord.js'
import { history, session } from '../util/database.js'

/** @type {import('discord.js').ApplicationCommand} */
export default {
  name: 'revise',
  description: 'See who is allowed to join channel',
  dmPermission: false,

  // TODO: maybe add an option to check someone else's channel

  /**
   * @this {import('discord.js').Interaction}
   * @param {import('discord.js').BaseGuildVoiceChannel} [channel=this.member.voice.channel]
   */
  async execute(channel = this.member.voice.channel) {

    const { hub, host } = Object(await session.get(channel?.id))

    if (!channel || !host)
      return this.reply({
        ephemeral: true,
        content: 'Please join a temporary voice channel before using this command.'
      })

    const { permissions = [] } = await history.get({ hub, user: host }) || {}

    const isPublic = channel
      .permissionsFor(this.guild.roles.everyone)
      .has('ViewChannel')

    const exceptions = new Array()
    const opposite = !isPublic ? 'allow' : 'deny'

    for (let id in permissions) {
      if (!(opposite in permissions[id])) continue

      const mention = permissions[id].type
        ? userMention(id)
        : roleMention(id)

      exceptions.push(mention)
    }

    const embed = new EmbedBuilder()

    embed.setTitle(`${channel} is __${isPublic ? 'open' : 'closed'}__ for everyone ${exceptions.length ? 'except:' : ''}`)
    embed.setColor(0x5865f2)

    if (exceptions.length) embed.setDescription(exceptions.map(i => `- ${i}`).join('\n'))

    if (!isPublic) embed.setFooter({ text: 'Note \u2014 Administrators always have full access!' })

    this.reply({
      ephemeral: true,
      embeds: [embed]
    })
  }
}

