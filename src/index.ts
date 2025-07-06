import path from 'node:path'
import http from 'node:http'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Client, GatewayIntentBits } from 'discord.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client: any = new Client({
  intents: [
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.Guilds
  ],
  shards: 'auto'
})

client.commands = new Map()

for (const file of readdirSync(path.join(__dirname, 'commands')))
  if (file.endsWith('.js')) {
    const command = (await import(`./commands/${file}`)).default
    client.commands.set(command.name, command)
  }

for (const file of readdirSync(path.join(__dirname, 'events')))
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

// HTTP health checks responder for some hosting platforms
http
  .createServer((_, res) => res.end())
  .listen(process.env.PORT)
