import type { Client } from "discord.js";
import type { ApplicationCommandData } from "discord.js";

export default async function(this: Client<true>): Promise<void> {
  console.info('Ready as', this.user.tag)

  this.application.commands.set(this.commands.map((command: { data: ApplicationCommandData }) => command.data))
}
