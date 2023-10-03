const { session, history } = require('../util/database')

/**
 * Get rid of properties that don't need to be differed
 * @param {import('discord.js').GuildChannel} channel 
 */
function prune (channel) {
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

/**
 * @param {import('discord.js').NonThreadGuildBasedChannel} past Previous channel instance
 * @param {import('discord.js').NonThreadGuildBasedChannel} channel Updated channel instance
 * @this import('discord.js').Client
 */
module.exports = async function (past, channel) {

	// return if it's not a voice channel
	if (channel.type != 2) return

	const { host, hub } = Object(await session.get(channel.id))

	if (!host) return

	const guild = channel.guildId

	// prevent user limit bypass (see issue #2)
	if (past.userLimit != channel.userLimit) {
		const permissions = channel.permissionOverwrites
		const closed = permissions.resolve(guild)?.deny.has('Connect')

		// if the channel is full but open
		// or the channel is free but closed
		if (channel.full != closed) {
			// toggle the channel state
			permissions.edit(guild, { Connect: closed && null }).catch(()=>{})
		}
	}

	past = prune(past)
	channel = prune(channel)

	const diff = {}

	for (const entry in channel)
		if (past[entry] != channel[entry])
			diff[entry] = channel[entry]

	history.set({ hub, user: host }, { guild, ...diff })
}
