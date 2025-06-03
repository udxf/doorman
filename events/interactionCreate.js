/**
 * @param {import('discord.js').Interaction} int Interaction instance
 * @this {import('discord.js').Client}
 */
export default async function(int) {

  if (!int.isCommand()) return

  const command = this.commands.get(int.commandName)

  if (!command) return

  let execute = command.execute
  let options = command.options

  // handle context menus
  if (int.commandType == 2) options = [{ name: 'user' }]
  if (int.commandType == 3) options = [{ name: 'message' }]

  // resolve subcommand
  if (!execute && options?.[0].type < 3)
    for (let i = options[0].type; i > 0; i--) {
      execute = (execute || command)[options[0].name]
      options = options[0].options
    }

  // execute with resolved options
  execute.apply(int, options?.map(({ name }) => {
    const option = int.options.get(name)

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
