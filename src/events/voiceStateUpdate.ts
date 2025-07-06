import { hubs, history, session } from '../util/database.js'
import {
  ChannelType,
  type CategoryChannelResolvable,
  type Client,
  type VoiceRegion,
  type VoiceState
} from 'discord.js'

function resolve(name: string, { member }: VoiceState): string {
  if (!member) return name

  const vars = new Map([
    ['user.id', member.id],
    ['user.name', member.displayName],
    ['user.username', member.user.username],
  ])

  return name.replace(/\{(.+)\}/g, (str, key) => vars.get(key) ?? str)
}

export default async function(
  this: Client<true>,
  oldState: VoiceState,
  newState: VoiceState,
): Promise<void> {
  const { channel, guild, member } = newState

  if (oldState.channel?.members.filter(m => !m.user.bot).size == 0
    && oldState.channel.deletable
    && oldState.channel.joinable // you can't manage channels you can't join
    && await session.get(oldState.channel.id)
  ) {
    oldState.channel?.delete().catch(() => null)
  }

  if (oldState.channelId == newState.channelId) return

  // Patch user limit bypass (see issue #2)
  for (const { channel } of [newState, oldState]) if (channel?.members.size) {
    const permissions = channel.permissionOverwrites
    const everyonePermissions = permissions.resolve(guild.id)

    if (!everyonePermissions) continue

    const isClosed = everyonePermissions.deny.has('Connect')

    // if the channel is full but open
    // or the channel is free but closed
    if (channel.full != isClosed && await session.get(channel.id)) {
      // toggle the channel state
      permissions.edit(guild.id, { Connect: isClosed && null }).catch(() => { })
    }
  }

  if (!channel?.permissionsFor(guild.members.me!).has(0x1100410n)) return

  const hub = await hubs.get(channel.id)

  if (!hub) return

  if (member!.user.bot) {
    newState.disconnect()
    return
  }

  const options = {
    ...hub.defaults,
    ...await history.get({
      hub: channel.id,
      user: member!.id
    })
  }

  const permissionOverwrites = []

  for (const id in options.permissions || {}) {
    const entry = options.permissions![id]!

    permissionOverwrites.push({
      id,
      type: entry.type,
      deny: BigInt(entry.deny || 0),
      allow: BigInt(entry.allow || 0)
    })
  }

  // Patch user limit bypass (see issue #2)
  if (options.userLimit == 1) {
    let perm = permissionOverwrites.find(o => o.id == guild.id)

    if (perm) perm.deny += 0x100000n
    else {
      permissionOverwrites.push({
        id: guild.id,
        deny: 0x100000n
      })
    }
  }

  const regions = await this.rest.get('/voice/regions') as VoiceRegion[]

  // Avoid unsupported RTC regions to prevent crashes (see issue #8)
  if (options.rtcRegion && !regions.find(i => i.id == options.rtcRegion)) {
    options.rtcRegion = null
  }

  // Resolve category
  let category: CategoryChannelResolvable | undefined

  if (options.parent) {
    let fetchedChannel = await guild.channels.fetch(options.parent).catch(() => null)
    category = options.parent && fetchedChannel?.id || newState.channel!.parentId!
  }

  const room = await guild.channels.create<ChannelType.GuildVoice>({
    type: ChannelType.GuildVoice,
    ...options as any,

    name: resolve(options.name || "{user.name}'s channel", newState),
    bitrate: Math.min(options.bitrate!, guild.maximumBitrate),
    ...(category && { parent: category }),

    permissionOverwrites: [
      ...permissionOverwrites,
      {
        id: member!.id,
        allow: ['ViewChannel', 'Connect', 'ManageChannels', 'MoveMembers']
      },
      {
        id: this.user.id,
        allow: ['ViewChannel', 'Connect', 'ManageChannels']
      }
    ]
  })

  try {
    await newState.setChannel(room)

    session.set(room.id, {
      hub: channel.id,
      host: member!.id,
      guild: guild.id
    })
  } catch {
    if (!room.nsfw) {
      room.delete().catch(() => { })
      return
    }

    // looks like the user is under 18yo. Retry with nsfw disabled
    try {
      await room.setNSFW(false)
      await newState.setChannel(room)

      session.set(room.id, {
        hub: channel.id,
        host: member!.id,
        guild: guild.id
      })
    } catch (err) {
      room.delete().catch(() => { })
      console.log(err)
    }
  }
}
