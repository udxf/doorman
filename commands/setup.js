import {
  ApplicationCommandOptionType as OptionType,
  ChannelType,
  Collection,
  REST,
  InteractionContextType,
  MessageFlags
} from 'discord.js'
import { hubs } from '../util/database.js'

const rest = new REST()
rest.setToken(process.env.TOKEN)

async function getRegions() {
  let regions = await rest.get('/voice/regions')

  regions = regions.map(i => ({
    name: i.name,
    value: i.id
  }))

  return regions
}

function lackingPermissions(permissions) {
  const targets = [
    [0x00000400n, 'View Channels'],
    [0x00100000n, 'Connect'],
    [0x00000010n, 'Manage Channels'],
    [0x10000000n, 'Manage Roles'],
    [0x01000000n, 'Move Members'],
    [0x00000800n, 'Send Messages']
  ]

  const lacks = targets
    .filter(([flag, name]) => !permissions.has(flag))
    .map(([flag, name]) => `**${name}**`)

  return [{
    color: 0xed4245,
    title: 'Missing permissions',
    description: `Doorman lacks the ${lacks.join(', ').replace(/,([^,]*)$/, ' and$1')} permission${lacks.length > 1 ? 's' : ''}. Please provide the missing permission${lacks.length > 1 ? 's' : ''} and try again.`
  }];
}

/** @type {import('discord.js').ApplicationCommand} */
export default {
  name: 'setup',
  description: 'Setup a hub channel',
  defaultMemberPermissions: 0x8n,
  contexts: [InteractionContextType.Guild],
  options: [
    {
      type: OptionType.Channel,
      name: 'channel',
      description: 'Voice channel to setup as hub',
      channelTypes: [ChannelType.GuildVoice]
    },

    // Options for default configuration of temporary channels
    // See https://discord.com/developers/docs/resources/channel for reference

    {
      type: OptionType.String,
      name: 'name',
      description: 'Default name for temporary channels',
      maxLength: 100,
      minLength: 1
    },
    {
      type: OptionType.Boolean,
      name: 'nsfw',
      description: 'Are temporary channels NSFW by default?'
    },
    {
      type: OptionType.Integer,
      name: 'bitrate',
      description: 'Default bitrate (in kbps) for temporary channels',
      maxValue: 384,
      minValue: 8
    },
    {
      type: OptionType.Integer,
      name: 'user-limit',
      description: 'Default user limit for temporary channels',
      maxValue: 99,
      minValue: 0
    },
    {
      type: OptionType.Integer,
      name: 'slowmode',
      description: 'Default message threshold (in seconds) for temporary channels',
      maxValue: 21600,
      minValue: 0
    },
    {
      type: OptionType.Channel,
      name: 'parent',
      description: 'Category to create channels at',
      channelTypes: [ChannelType.GuildCategory]
    },
    {
      type: OptionType.String,
      name: 'region',
      description: 'Default connection region for temporary channels',
      choices: [
        {
          name: 'Automatic',
          value: 'automatic'
        },
        ...await getRegions()
      ]
    },
    {
      type: OptionType.String,
      name: 'video-quality',
      description: 'Default channel video quality mode',
      choices: [
        {
          name: 'Auto',
          value: '1'
        },
        {
          name: 'Full',
          value: '2'
        }
      ]
    }
  ],

  /** @this {import('discord.js').Interaction} */
  async execute(
    channel,
    name,
    nsfw,
    bitrate,
    userLimit,
    rateLimitPerUser,
    parent,
    rtcRegion,
    videoQualityMode
  ) {
    const permissions = channel?.permissionsFor(this.applicationId)
      || this.guild.members.me.permissions

    if (!permissions.has(0x11100c10n)) {
      return this.reply({
        flags: MessageFlags.Ephemeral,
        embeds: lackingPermissions(permissions)
      })
    }

    // TODO: forbid using this command on temporary voice channels

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
    } else {
      channel.permissionOverwrites.edit(
        this.guild.roles.everyone,
        { SendMessages: false }
      )
    }

    await hubs.set(channel.id, Object.fromEntries(
      new Collection([
        ['guild', this.guildId],
        ['defaults.name', name],
        ['defaults.bitrate', bitrate && bitrate * 1000],
        ['defaults.nsfw', nsfw],
        ['defaults.parent', parent?.id],
        ['defaults.rateLimitPerUser', rateLimitPerUser],
        ['defaults.rtcRegion', rtcRegion == 'automatic' ? null : rtcRegion],
        ['defaults.userLimit', userLimit],
        ['defaults.videoQualityMode', videoQualityMode]
      ]).filter(i => i !== undefined)
    ))

    this.reply({
      flags: MessageFlags.Ephemeral,
      content: `Joining ${channel} now makes temporary voice channels with configuration you've specified by default. Users can edit their temporary voice channels, and their changes will be saved for them.`
    })
  }
}
