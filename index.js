'use strict'

const
  { readdirSync } = require('fs'),
  { Client, GatewayIntentBits } = require('discord.js'),
  client = new Client({
    intents: [
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.Guilds
    ],
    shards: 'auto'
  })

client.commands = new Map()

for (const file of readdirSync('commands'))
  if (file.endsWith('.js')) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
  }

for (const file of readdirSync('events'))
  if (file.endsWith('.js'))
    client.on(
      file.split('.')[0],
      require(`./events/${file}`).bind(client)
    )

client.login(process.env.TOKEN)
  .then(async () => {
    await client.application.fetch()

    /**
     * Environment variable GUILD specifies id of a guild to update commands for.
     * Guild-specific commands are updated instantly (unlike global commands), so testing goes faster.
     *
     * Remove it from environment while not debugging.
     */
    client.application.commands.set([...client.commands.values()], process.env.GUILD)
  })

// HTTP health checks responder for some hosting platforms
require('http')
  .createServer((req, res) => res.end())
  .listen(process.env.PORT)
