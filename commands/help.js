
/** @type {import('discord.js').CommandInteraction} */
module.exports = {
	name: 'help',
	description: 'Get helpful information about the bot',
	dmPermission: false,

	async execute () {
		const commands = this.client.application.commands.cache
		const command = (name) => `</${name}:${commands.find(c => c.name == name)?.id || 0}>`

		const adminHelp = [
			{
				title: 'Getting Started',
				description: `First of all, lets make a hub! Hub is an entry point voice channel for making temporary voice channels. Use ${command('setup')} to create or specify a channel that will function as a hub for temporary voice channels.\n\nNow when you made a hub, you can ${command('configure')} it, specifying default settings for temporary voice channels. Keep in mind that it's just defaults, and users can change them for their temporary channels individually.`,
				color: 0x5865f2
			},
			{
				title: 'List of Commands',
				description: `- ${command('help')} — Get help on how to use the bot\n- ${command('setup')} — Make a hub for temporary voice channels\n- ${command('configure')} — Specify default settings for temporary voice channels created using certain hub\n- ${command('close')} — Make your temporary voice channel invisible for everyone or somebody specific\n- ${command('open')} — Make your temporary voice channel open to everyone or somebody specific`,
				color: 0x5865f2
			},
			{
				title: 'About Hubs',
				description: `Hubs are voice channels that redirect users to temporary voice channels. You can make multiple hubs using ${command('setup')}, and then ${command('configure')} default settings of temporary voice channels created by joining that specific hub.`,
				color: 0x5865f2
			}
		]

		const userHelp = [
			{
				title: 'About Hubs',
				description: `Hubs are voice channels that redirect users to temporary voice channels. When you join it, you get automatically moved to a newly created temporary voice channel.`,
				color: 0x5865f2
			},
			{
				title: 'List of Commands',
				description: `- ${command('help')} — Get help on how to use the bot\n- ${command('close')} — Make your temporary voice channel invisible for everyone or somebody specific\n- ${command('open')} — Make your temporary voice channel open to everyone or somebody specific`,
				color: 0x5865f2
			}
		]

		const localHelp = this.memberPermissions.has(0x8n) ? adminHelp : userHelp

		this.reply({
			ephemeral: true,
			embeds: [
				...localHelp,
				{
					title: 'About Temporary Channels',
					description: `Temporary voice channels can be created by joining a hub, and they get automatically deleted when get empty. Channel owner has the permission to edit channel settings, but not channel permissions due to some potential abusement reasons. Instead of managing channel permissions directly from channel settings, channel owner can use ${command('close')} and ${command('open')} commands on everyone, users and roles.\n\nChanges made in channel settings are saved for future sessions, as well as channel permissions set using ${command('close')} and ${command('open')} commands. (channel permissions set directly from channel settings don't get saved)\n\nThere can be multiple hubs on a single server, so temporary channel settings get saved and restored depending on a hub. That means that your changes in temporary channels are different for different hubs.`,
					color: 0x5865f2
				}
			]
		})
	}
}
