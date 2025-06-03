import { hubs } from '../util/database.js'

/** @type {import('discord.js').ApplicationCommand} */
export default {
  name: 'setup',
  description: 'Make a voice hub that creates voice channels',
  defaultMemberPermissions: 0x8n,
  dmPermission: false,

  options: [
    {
      type: 7,
      name: 'channel',
      description: 'Use an existing voice channel as a hub',
      channelTypes: [2]
    }
  ],

  /**
   * @param {import('discord.js').VoiceChannel} [channel]
   * @this {import('discord.js').Interaction}
   */
  async execute(channel) {
    const permissions = channel?.permissionsFor(this.applicationId)
      || this.guild.members.me.permissions

    if (!permissions.has(0x11100c10n))
      return this.reply({
        ephemeral: true,
        embeds: lackingPermissions(permissions)
      })

    if (!channel) {
      channel = await this.guild.channels.create({
        type: 2, // voice
        name: 'Voice Hub',
        permissionOverwrites: [
          {
            // disable SEND_MESSAGES (0x800) permission for @everyone
            id: this.guild.id,
            deny: 0x800n
          },
          {
            // enable MOVE_MEMBERS (0x1000000) permission for the bot
            id: this.applicationId,
            allow: 0x1000000n
          }
        ]
      })
    }
    else channel.permissionOverwrites.edit(
      this.guild.roles.everyone,
      { SendMessages: false }
    )

    await hubs.set(channel.id, { guild: this.guildId })

    this.reply({
      ephemeral: true,
      content: `Joining ${channel} now makes temporary voice channels.`
    })
  }
}

function lackingPermissions(permissions) {
  const targets = [
    [0x00000400n, "View Channels"],
    [0x00100000n, "Connect"],
    [0x00000010n, "Manage Channels"],
    [0x10000000n, "Manage Roles"],
    [0x01000000n, "Move Members"],
    [0x00000800n, "Send Messages"]
  ]

  const lacks = targets
    .filter(([flag, name]) => !permissions.has(flag))
    .map(([flag, name]) => `**${name}**`)

  return [{
    color: 0xed4245,
    title: "Missing permissions",
    description: `Doorman lacks the ${lacks.join(', ').replace(/,([^,]*)$/, ' and$1')} permission${lacks.length > 1 ? 's' : ''}. Please provide the missing permission${lacks.length > 1 ? 's' : ''} and try again.`
  }];
}
