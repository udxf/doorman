const { hubs } = require('../util/database')

/** @type {import('discord.js').ApplicationCommand} */
module.exports = {
	name: 'setup',
	description: 'Make a voice hub that creates voice channels',
	defaultMemberPermissions: 0x8n, // manage channels
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
	async execute (channel) {
		const permissions = this.appPermissions

		if (!permissions.has(0x11100c10n))
			return this.reply({
				ephemeral: true,
				embeds: lackingPermissions(permissions)
			})

		if (!channel)
			channel = await this.guild.channels.create({
				type: 2, // voice channel type,
				name: 'Voice Hub',
				permissionOverwrites: [
					{
						// disables SEND_MESSAGES (0x800) permission for @everyone
						id: this.guild.id,
						deny: 0x800n
					},
					{
						// enables MOVE_MEMBERS (0x1000000) permission for the bot
						id: this.client.user.id,
						allow: 0x1000000n
					}
				]
			})
		else channel.permissionOverwrites.edit(
			this.guild.roles.everyone,
			{
				SendMessages: false
			}
		)

		await hubs.set(channel.id, {
			guild: this.guildId
		})

		this.reply({
			ephemeral: true,
			content: `Joining ${channel} now makes temporary voice channels.`
		})
	}
}

function lackingPermissions (permissions) {
	let embeds = new Array()

	if (!permissions.has(['ViewChannel', 'Connect']))
		embeds.push({
			title: 'Bot is lacking access',
			description: "Please grant the bot `View Channels` and `Connect` permissions. Other required permissions have no effect without these two.",
			color: 0xed4245
		})

	if (!permissions.has('ManageChannels'))
		embeds.push({
			title: "Bot can't manage channels",
			description: "Without `Manage Channels` permission the bot can't create temporary voice channels for members. Please, grant the bot the permission and try again.",
			color: 0xed4245
		})

	if (!permissions.has('ManageRoles'))
		embeds.push({
			title: "Bot can't manage channel permissions",
			description: "Without `Manage Roles` permission the bot can't grant users access to their temporary voice channels. Please, grant the bot the permission and try again.",
			color: 0xed4245
		})

	if (!permissions.has('MoveMembers'))
		embeds.push({
			title: "Bot can't move members",
			description: "Without `Move Members` permission the bot can't move users to their temporary voice channels. Please, grant the bot the permission and try again.",
			color: 0xed4245
		})

	if (!permissions.has('SendMessages'))
		embeds.push({
			title: "Bot can't send messages",
			description: "Without `Send Messages` permission the bot can't properly pre-configure hubs. Please, grant the bot the permission and try again.",
			color: 0xed4245
		})

	return embeds
}
