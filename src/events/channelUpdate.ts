import { session, history } from '../util/database.js'
import {
  ChannelType,
  type Client,
  type DMChannel,
  type NonThreadGuildBasedChannel,
  type VoiceChannel
} from 'discord.js'

function prune(channel: VoiceChannel): { [key: string]: any } {
  return {
    name: channel.name,
    bitrate: channel.bitrate,
    nsfw: channel.nsfw,
    rateLimitPerUser: channel.rateLimitPerUser,
    rtcRegion: channel.rtcRegion,
    userLimit: channel.userLimit,
    videoQualityMode: channel.videoQualityMode,
    parent: channel.parentId
  }
}

export default async function(
  this: Client<true>,
  oldChannel: DMChannel | NonThreadGuildBasedChannel,
  newChannel: DMChannel | NonThreadGuildBasedChannel,
): Promise<void> {
  if (newChannel.type != ChannelType.GuildVoice) return;
  if (oldChannel.type != ChannelType.GuildVoice) return;

  const { host, hub } = Object(await session.get(newChannel.id))

  if (!host) return

  const guild = newChannel.guildId

  // prevent user limit bypass (see issue #2)
  if (oldChannel.userLimit != newChannel.userLimit) {
    const permissions = newChannel.permissionOverwrites
    const closed = permissions.resolve(guild)!.deny.has('Connect')

    // if the channel is full but open
    // or the channel is free but closed
    if (newChannel.full != closed) {
      // toggle the channel state
      permissions.edit(guild, { Connect: closed && null }).catch(() => { })
    }
  }

  const prunedOldChannel = prune(oldChannel)
  const prunedNewChannel = prune(newChannel)

  const diff: { [key: string]: any } = {}

  for (const key in prunedNewChannel) {
    if (prunedOldChannel[key] !== prunedNewChannel[key]) {
      diff[key] = prunedNewChannel[key]
    }
  }

  history.set({ hub, user: host }, { guild, ...diff })
}
