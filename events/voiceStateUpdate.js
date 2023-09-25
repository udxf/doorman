const { hubs, history, session } = require('../util/database')

/**
 * Replaces `{tags}` in a channel name with their actual values
 * @param {string} name Name of a channel to format
 * @param {import('discord.js').VoiceState} param1 Voice state to get data from
 * @returns {string}
 */
function resolve (name, { member }) {
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
module.exports = async function (past, state) {
	const { channel, guild, member } = state

	if ( past.channel?.members.filter(m => !m.user.bot).size == 0
		&& past.channel.deletable
		&& past.channel.joinable // you can't manage channels you can't join
		&& await session.get(past.channelId))
		past.channel?.delete().catch(() => null)

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
		if (!room.nsfw) return room.delete().catch(() => {})

		// looks like the user is under 18yo. Retry with nsfw disabled

		await room.setNSFW(false)

		state.setChannel(room).catch(async err => {
			console.error(err)

			// nsfw isn't the cause. Revert actions

			await room.setNSFW(true)
			room.delete()
		})
	}
}
