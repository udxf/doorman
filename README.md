# Doorman

## About

Doorman is a bot for Discord powered by [discord.js][discord-js]. It provides
servers with temporary voice channels that are managed by users and removed
automatically once everyone leaves the channel.

## Getting Started

### Invite the bot

You can [invite the official bot][invitation] or host your own instance of it by
following the [provided instructions](docs/deploy.md).

### Setup a hub

Hub is a voice channel by joining which user gets their own temporary channel.

To make a hub, use `/setup` command and specify a channel you want to convert
into a hub. If no channel is specified, a new one will be created as a hub.

From now on the bot is going to move everyone (except bots) from the hub to a
temporary voice channel when they join.

> [!NOTE]
> You can make multiple hubs, each with it's own configuration.

## Usage

To create a temporary voice channel, join a hub.

By default, user is given permissions to manage it's own channel settings and
move members from it. However, you can't manage channel permissions directly due
to potential permission abusement, so there's `/open` and `/close` commands, as
well as corresponding context menu buttons, to decide who can join your channel.

All changes made to a temporary channel are automatically restored.

> [!WARNING]
> Only permission overwrites set through commands will be restored in future
> sessions. Manually changed channel permissions will not be automatically
> restored by the bot for security reasons.

Temporary channels are linked to a hub. This means your channel settings will be
restored on that hub your channel was created with, so joining a different hub
will restore different settings, depending on the hub.

## Contributing

Use [GitHub Issues](https://github.com/udxf/doorman/issues) to report bugs and
suggest new features.

[discord-js]: https://github.com/discordjs/discord.js
[invitation]: https://discord.com/api/oauth2/authorize?client_id=1073645118395002960&permissions=286262288&scope=bot%20applications.commands
