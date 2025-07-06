import type { Client } from "discord.js";

export default async function(this: Client<true>): Promise<void> {
  console.info('Ready as', this.user.tag)
}
