import { readdirSync } from 'fs'
import { Client, GatewayIntentBits } from 'discord.js'

const client = new Client({
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.Guilds
  ],
  shards: 'auto'
})

client.commands = new Map()

for (const file of readdirSync('commands'))
  if (file.endsWith('.js')) {
    const command = (await import(`./commands/${file}`)).default
    client.commands.set(command.name, command)
  }

for (const file of readdirSync('events'))
  if (file.endsWith('.js'))
    client.on(
      file.split('.')[0],
      (await import(`./events/${file}`)).default.bind(client)
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

import http from 'node:http';

// HTTP health checks responder for some hosting platforms
http
  .createServer((req, res) => res.end())
  .listen(process.env.PORT)
