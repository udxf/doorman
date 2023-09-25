If you don't understand this document, consider [inviting the official bot](https://discord.com/api/oauth2/authorize?client_id=1073645118395002960&permissions=286262288&scope=bot%20applications.commands).

This is a guide on how to prepare and run Doorman on your own machine or deploy it to a hosting.

## Register a bot

1. [Create](https://discord.com/developers/applications?new_application=true) a bot application

2. Head over to the **Bot** page, generate a token and save it somewhere safe — it will be used later

Make sure to never share your token with anyone, since it can be used to do almost anything with your bot, including malicious acts.

## Prepare database

Doorman uses [MongoDB](https://www.mongodb.com) to store various channel data and configuration. Database is required for Doorman to work properly, so below are instructions on how to prepare one.

1. [Register](https://account.mongodb.com/account/register) for a MongoDB Atlas account

2. Create a free **M0** shared cluster

3. At the **Security Quickstart** or **Database Access** page, create a database user with secure password

4. At the **Security Quickstart** or **Network Access** page, add `0.0.0.0` to IP access list to be able to connect from anywhere

5. Head over to **Overview** page and click the **Connect** button

6. Choose **Drivers** option

7. Copy the connection string and replace `<password>` with the actual database user password

It should look like this: `mongodb+srv://john:S3curePa$$word@cluster0.etdwv87.mongodb.net/MyDatabase`

Note that you don't need the `?retryWrites=true&w=majority` part because these options are already being set within the source code.

Also notice the `/MyDatabase` part at the end — this will be the name of database used by Doorman. You can rename it if you want, and if you remove it, the bot will use the `doorman` database by default. The database will be created automatically if it's missing. Changing the name in the connection string won't rename the database at MongoDB; instead it will create a new database along with the old one.

## Run locally

1. Install Node.js and npm following [this guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

2. [Download](https://github.com/udxf/doorman/archive/refs/heads/main.zip) this repository or clone it using `git`

```sh
git clone https://github.com/udxf/doorman.git
cd doorman
```

Note that you have to execute next steps from within the **doorman** folder.

3. Install all dependencies

```sh
npm i
```

4. Run the bot, specifying the **`TOKEN`** and **`DATABASE`** environment variables

```sh
TOKEN=<bot_token> DATABASE=<mongodb_uri> node .
# dot at the end is required
```

Replace `<bot_token>` and `<mongodb_uri>` with their actual values. If you don't have these, see [how to register a bot](#register-a-bot) for token, or [how to prepare MongoDB database](#prepare-database) for MongoDB URI (connection string).

If you're working on commands, you may find useful the **`GUILD`** variable. When defined, Doorman will update commands *instantly* for that guild, but all other guilds will have no commands. It's useful for debugging, because global commands get updated with significant delay.

## Deploy onto a hosting

Process of deploying may vary depending on a hosting provider, so you should follow hosting-specific documentation to deploy everything the right way. The most important part here is to upload the source code and specify **`TOKEN`** and **`DATABASE`** environment variables at the hosting.

Make sure the hosting you choose supports Node.js applications. Don't pay for hosting without a free trial if you're not sure if it's able to host Doorman.

Doorman runs on [Fly.io](https://fly.io). It provides a free plan that should be enough for personal use. You can choose a different hosting provider if desired.
