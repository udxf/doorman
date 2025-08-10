import type { Client } from "discord.js";
import type { ApplicationCommandData } from "discord.js";

export default async function(this: Client<true>): Promise<void> {
  console.info('Ready as', this.user.tag)
  /**
   * Environment variable GUILD specifies id of a guild to update commands for.
   * Guild-specific commands are updated instantly (unlike global commands), so testing goes faster.
   *
   * Remove it from environment while not debugging.
   */
  this.application.commands.set(this.commands.map((command: { data: ApplicationCommandData }) => command.data), process.env.GUILD as string)
}
