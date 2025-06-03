import {
  ApplicationCommandOptionType as OptionType,
  ChannelType,
  Collection
} from 'discord.js'
import { hubs } from '../util/database.js'

/** @type {import('discord.js').ApplicationCommand} */
export default {
  name: 'configure',
  description: 'Configure default settings of temporary voice channels',
  options: [
    // TODO: add "overwrite" boolean option or something to treat unspecified options as deletion

    {
      type: OptionType.Channel,
      name: 'hub',
      description: 'Hub to apply the configuration on',
      channelTypes: [ChannelType.GuildVoice],
      required: true
    },
    {
      type: OptionType.String,
      name: 'name',
      description: 'Default channel name',
      maxLength: 100,
      minLength: 1
    },
    {
      type: OptionType.Integer,
      name: 'bitrate',
      description: 'Default channel bitrate (in kbps)',
      maxValue: 384,
      minValue: 8
    },
    {
      type: OptionType.Boolean,
      name: 'nsfw',
      description: 'Default channel nsfw state'
    },
    {
      type: OptionType.Channel,
      name: 'parent',
      description: 'Category to create channels at',
      channelTypes: [ChannelType.GuildCategory]
    },
    {
      type: OptionType.Integer,
      name: 'slowmode',
      description: 'Default channel message threshold (in seconds)',
      maxValue: 21600,
      minValue: 0
    },
    {
      type: OptionType.String,
      name: 'region',
      description: 'Default channel connection region',
      choices: [
        {
          name: 'Automatic',
          value: 'automatic'
        },
        {
          name: 'Brazil',
          value: 'brazil'
        },
        {
          name: 'Hong Kong',
          value: 'hongkong'
        },
        {
          name: 'India',
          value: 'india'
        },
        {
          name: 'Japan',
          value: 'japan'
        },
        {
          name: 'Rotterdam',
          value: 'rotterdam'
        },
        {
          name: 'Russia',
          value: 'russia'
        },
        {
          name: 'Singapore',
          value: 'singapore'
        },
        {
          name: 'South Africa',
          value: 'southafrica'
        },
        {
          name: 'Sydney',
          value: 'sydney'
        },
        {
          name: 'US Central',
          value: 'us-central'
        },
        {
          name: 'US East',
          value: 'us-east'
        },
        {
          name: 'US South',
          value: 'us-south'
        },
        {
          name: 'US West',
          value: 'us-west'
        }
      ]
    },
    {
      type: OptionType.Integer,
      name: 'user-limit',
      description: 'Default channel user limit',
      maxValue: 99,
      minValue: 0
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
  defaultMemberPermissions: 0x8n,
  dmPermission: false,

  /** @this {import('discord.js').Interaction} */
  async execute(channel, name, bitrate, nsfw, parent, rateLimitPerUser, rtcRegion, userLimit, videoQualityMode) {

    if (!await hubs.get(channel.id, { _id: 1 }))
      return this.reply({
        ephemeral: true,
        embeds: [{
          title: "Looks like this isn't a hub",
          description: `Please, use this command on a hub channel.\n\nIf you want to make this channel a hub for temporary voice channels, use </setup:${this.client.application.commands.cache.find(c => c.name == 'setup').id}> command and try to use </configure:${this.command.id}> again.`,
          color: 0xed4245
        }]
      })

    await hubs.set(channel.id, Object.fromEntries(
      new Collection([
        ['defaults.name', name],
        ['defaults.bitrate', bitrate && bitrate * 1000],
        ['defaults.nsfw', nsfw],
        ['defaults.parent', parent?.id],
        ['defaults.rateLimitPerUser', rateLimitPerUser],
        ['defaults.rtcRegion', rtcRegion == 'automatic' ? null : rtcRegion],
        ['defaults.userLimit', userLimit],
        ['defaults.videoQualityMode', videoQualityMode]
      ])
        .filter(i => i !== undefined)
    ))

    this.reply({
      ephemeral: true,
      embeds: [{
        title: 'Configuration saved',
        description: `All new channels created by joining ${channel} will have this configuration by default. Keep in mind that users can edit their temporary voice channels, and their changes will be saved for them.`,
        color: 0x3ba55c
      }]
    })
  }
}
