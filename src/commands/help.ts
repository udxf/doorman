import {
  InteractionContextType,
  MessageFlags,
  type ChatInputCommandInteraction,
} from 'discord.js'

export default {
  name: 'help',
  description: 'Get helpful information about the bot',
  contexts: [InteractionContextType.Guild],

  async execute(this: ChatInputCommandInteraction<'cached'>): Promise<void> {

    const commands = this.client.application.commands.cache
    const command = (name: string) => `</${name}:${commands.find(c => c.name == name)?.id || 0}>`

    const adminHelp = [
      {
        title: 'Getting Started',
        description: `First of all, lets make a hub! Hub is an entry point voice channel for making temporary voice channels. Use ${command('setup')} to create or specify a channel that will function as a hub for temporary voice channels.\n\nYou can specify default settings for temporary voice channels created by that specific hub. Keep in mind that it's just defaults, and users can change them for their temporary channels individually.`,
        color: 0x5865f2
      },
      {
        title: 'List of Commands',
        description: `- ${command('help')} — Get help on how to use the bot\n- ${command('setup')} — Make a hub for temporary voice channels\n- ${command('close')} — Make your temporary voice channel invisible for everyone or somebody specific\n- ${command('open')} — Make your temporary voice channel open to everyone or somebody specific\n- ${command('revise')} — Check who is allowed to join channel you're currently in`,
        color: 0x5865f2
      },
      {
        title: 'About Hubs',
        description: `Hubs are voice channels that redirect users to temporary voice channels. You can make multiple hubs using ${command('setup')}, each with it's own default configuration for temporary voice channels created by joining that specific hub.`,
        color: 0x5865f2
      },
      {
        title: 'Templated Strings',
        description: "If you name a channel as `Channel of {user.name}`, upon creation it'll be named `Channel of Wampus` (for example). Notice the `{user.name}` part - this is a **tag**, text pattern that gets replaced by some actual value.",
        fields: [{
          name: 'List of available tags',
          value: "- `{user.id}` — The ID of the user.\n- `{user.name}` — The global display name of the user, or their username if they don't have one.\n- `{user.username}` — The username of the user."
        }],
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

    const localHelp = this.memberPermissions?.has(0x8n) ? adminHelp : userHelp

    this.reply({
      flags: MessageFlags.Ephemeral,
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
