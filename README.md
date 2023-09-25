## About

Doorman is a bot for Discord built on top of [discord.js](https://github.com/discordjs/discord.js). It's designed to provide servers with temporary voice channels that are managed by users and are automatically removed after everyone leaves the channel, so the channel list stays as clean as possible.

## Getting Started

### Invite the bot

You can [invite the official bot][invitation] or host one yourself — here's [a guide](docs/deploy.md) on how to do that.

### Setup a hub

*Channel that makes temporary voice channels by joining it is referred to as a "hub" channel for simplicity.*

To make a hub channel, use `/setup` command. You can optionally specify an existing channel as option, then the bot will treat that channel as a hub. If not specified, a new channel will be automatically created as a hub.

From now on the bot is going to move everyone (except bots) from the hub to a temporary voice channel when they join.

You can make multiple hubs, each with it's own configuration. Use `/configure` command on a specific hub to configure default settings of temporary voice channels created by joining the specified hub. (so you can have different temporary channel defaults on a different hub)

## Usage

To create a temporary voice channel, join a hub.

User has permissions to manage it's own channel settings and move members from it. However, you can't manage channel permissions directly due to potential permission abusement, so there's `/open` and `/close` commands, as well as corresponding context menu buttons, to decide who can join your channel.

All changes you made to your temporary channel settings, except permission overwrites that were set using something other than the commands, are always being saved for future sessions. This way your channel settings get automatically restored when you create it again.

Temporary channel saves are linked to a hub. This means your channel settings will be restored on that hub your channel was created with, so joining a different hub will restore different settings, depending on the hub.

## Contributing

This project is open to anyone willing to make it better — any sort of help is welcome.

Use [GitHub Issues](https://github.com/udxf/doorman/issues) to report bugs and suggest new features.

[invitation]: https://discord.com/api/oauth2/authorize?client_id=1073645118395002960&permissions=286262288&scope=bot%20applications.commands
