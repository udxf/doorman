import { ApplicationCommandType, Client, Interaction } from "discord.js"

export default async function(
  this: Client<true>,
  interaction: Interaction,
): Promise<void> {
  if (!interaction.isCommand()) return
  if (interaction.commandType === ApplicationCommandType.PrimaryEntryPoint) return

  const command = (this as any).commands.get(interaction.commandName)

  if (!command) return

  let execute = command.execute
  let options = command.options

  // handle context menus
  if (interaction.commandType == 2) options = [{ name: 'user' }]
  if (interaction.commandType == 3) options = [{ name: 'message' }]

  // resolve subcommand
  if (!execute && options?.[0].type < 3) {
    for (let i = options[0].type; i > 0; i--) {
      execute = (execute || command)[options[0].name]
      options = options[0].options
    }
  }

  // execute with resolved options
  execute.apply(interaction, options?.map(({ name }: { name: string }): any => {
    const option = interaction.options.get(name)

    // resolve the option
    if (option) return (
      option.attachment
      || option.channel
      || option.role
      || option.member
      || option.user
      || option.message // for message context menus
      || option.value
    )
  }))
}
