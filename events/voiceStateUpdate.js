import { hubs, history, session } from '../util/database.js'

/**
 * Replaces `{tags}` in a channel name with their actual values
 * @param {string} name Name of a channel to format
 * @param {import('discord.js').VoiceState} param1 Voice state to get data from
 * @returns {string}
 */
function resolve(name, { member }) {
  const vars = new Map([
    ['user.id', member.id],
    ['user.name', member.displayName],
    ['user.username', member.user.username],
    ['user.tag', member.user.tag],
    ['user.discriminator', member.user.discriminator]
  ])

  return name.replace(/\{(.+)\}/g, (str, key) => vars.get(key) ?? str)
}

/**
 * @param {import('discord.js').VoiceState} past Past voice state of member
 * @param {import('discord.js').VoiceState} state New voice state of member
 * @this import('discord.js').Client
 */
export default async function(past, state) {
  const { channel, guild, member } = state

  if (past.channel?.members.filter(m => !m.user.bot).size == 0
    && past.channel.deletable
    && past.channel.joinable // you can't manage channels you can't join
    && await session.get(past.channelId))
    past.channel?.delete().catch(() => null)

  if (past.channelId == state.channelId) return

  // Patch user limit bypass (see issue #2)
  for (const ch of [channel, past.channel]) if (ch?.members.size) {
    const permissions = ch.permissionOverwrites
    const closed = permissions.resolve(guild.id)?.deny.has('Connect')

    // if the channel is full but open
    // or the channel is free but closed
    if (ch.full != closed && await session.get(ch.id)) {
      // toggle the channel state
      permissions.edit(guild.id, { Connect: closed && null }).catch(() => { })
    }
  }

  if (!channel?.permissionsFor(this.user).has(0x1100410n)) return

  const hub = await hubs.get(channel.id)

  if (!hub) return

  if (member.user.bot) return state.disconnect()

  const options = {
    ...hub.defaults,
    ...await history.get({
      hub: channel.id,
      user: member.id
    })
  }

  const permissionOverwrites = []

  for (const id in options.permissions || {}) {
    const entry = options.permissions[id]

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

  const regions = await rest.get('/voice/regions')

  // Avoid unsupported RTC regions to prevent crashes (see issue #8)
  if (options.rtcRegion && !regions.find(i => i.id == options.rtcRegion)) {
    options.rtcRegion = null
  }

  const room = await guild.channels.create({
    type: 2,
    ...options,

    name: resolve(options.name || "{user.name}'s channel", state),
    bitrate: Math.min(options.bitrate, guild.maximumBitrate),
    parent: options.parent && await guild.channels.fetch(options.parent).catch(() => null) || state.channel.parentId,

    permissionOverwrites: [
      ...permissionOverwrites,
      {
        id: member.id,
        allow: ['ViewChannel', 'Connect', 'ManageChannels', 'MoveMembers']
      },
      {
        id: this.user.id,
        allow: ['ViewChannel', 'Connect', 'ManageChannels']
      }
    ]
  })

  try {

    await state.setChannel(room)

    session.set(room.id, {
      hub: channel.id,
      host: member.id,
      guild: guild.id
    })

  } catch {
    if (!room.nsfw) return room.delete().catch(() => { })

    // looks like the user is under 18yo. Retry with nsfw disabled

    try {

      await room.setNSFW(false)
      await state.setChannel(room)

      session.set(room.id, {
        hub: channel.id,
        host: member.id,
        guild: guild.id
      })

    } catch (err) {
      room.delete().catch(() => { })
      console.log(err)
    }
  }
}
