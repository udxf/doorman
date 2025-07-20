import { hubs } from '../util/database.js'
import {
  REST,
  InteractionContextType,
  ApplicationCommandOptionType as OptionType,
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
  type VoiceRegion,
  type ChatInputCommandInteraction,
  type PermissionsBitField,
  type BaseGuildVoiceChannel,
  type CategoryChannel,
  type VideoQualityMode,
} from 'discord.js'

const rest = new REST()
rest.setToken(process.env.TOKEN!)

async function getRegions(): Promise<{ name: string, value: string }[]> {
  const regionsList = await rest.get('/voice/regions') as VoiceRegion[]

  return regionsList.map(i => ({
    name: i.name,
    value: i.id
  }))
}

function lackingPermissions(permissions: PermissionsBitField) {
  const targets: [bigint, string][] = [
    [PermissionFlagsBits.ViewChannel, 'View Channels'],
    [PermissionFlagsBits.Connect, 'Connect'],
    [PermissionFlagsBits.ManageChannels, 'Manage Channels'],
    [PermissionFlagsBits.ManageRoles, 'Manage Roles'],
    [PermissionFlagsBits.MoveMembers, 'Move Members'],
    [PermissionFlagsBits.SendMessages, 'Send Messages']
  ]

  const lacks = targets
    .filter(([flag]) => !permissions.has(flag))
    .map(([, name]) => `**${name}**`)

  return [{
    color: 0xed4245,
    title: 'Missing permissions',
    description: `Doorman lacks the ${lacks.join(', ').replace(/,([^,]*)$/, ' and$1')} permission${lacks.length > 1 ? 's' : ''}. Please provide the missing permission${lacks.length > 1 ? 's' : ''} and try again.`
  }];
}

export default {
  data: {
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
  },

  async execute(
    this: ChatInputCommandInteraction<'cached'>,
    channel?: BaseGuildVoiceChannel,
    name?: string,
    nsfw?: boolean,
    bitrate?: number,
    userLimit?: number,
    rateLimitPerUser?: number,
    parent?: CategoryChannel,
    rtcRegion?: string,
    videoQualityMode?: VideoQualityMode
  ): Promise<void> {
    const me = await this.guild.members.fetchMe()
    const permissions = channel?.permissionsFor(this.applicationId)
      || me.permissions

    if (!permissions!.has(0x11100c10n)) {
      this.reply({
        flags: MessageFlags.Ephemeral,
        embeds: lackingPermissions(permissions!)
      })

      return
    }

    // TODO: forbid using this command on temporary voice channels

    if (!channel) {
      channel = await this.guild.channels.create<ChannelType.GuildVoice>({
        type: ChannelType.GuildVoice,
        name: 'Voice Hub',
        permissionOverwrites: [
          {
            id: this.guild.roles.everyone,
            deny: PermissionFlagsBits.SendMessages
          },
          {
            id: this.applicationId,
            allow: PermissionFlagsBits.MoveMembers
          }
        ]
      })
    } else {
      channel.permissionOverwrites.edit(
        this.guild.roles.everyone,
        { SendMessages: false }
      )
    }

    await hubs.set(channel.id, {
      guild: this.guild.id,
      defaults: {
        ...(name && { name }),
        ...(bitrate && { bitrate: bitrate * 1000 }),
        ...(nsfw && { nsfw }),
        ...(parent && { parent: parent.id }),
        ...(rateLimitPerUser && { rateLimitPerUser }),
        ...(rtcRegion && { rtcRegion: rtcRegion !== 'automatic' ? rtcRegion : null }),
        ...(userLimit && { userLimit }),
        ...(videoQualityMode && { videoQualityMode }),
      }
    })

    this.reply({
      flags: MessageFlags.Ephemeral,
      content: `Joining ${channel} now makes temporary voice channels with configuration you've specified by default. Users can edit their temporary voice channels, and their changes will be saved for them.`
    })
  }
}
