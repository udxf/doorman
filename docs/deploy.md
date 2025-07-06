This document is a guide on how to setup Doorman to run either on your own
machine or a dedicated hosting provider.

> [!TIP]
> You can simply [invite an existing bot][invitation] if deploying one yourself
> is not actually something you want.

## Register a bot

1. [Create][create-bot] a bot application

2. Head over to the **Bot** page, generate a token and save it somewhere safe —
   it will be used later

> [!CAUTION]
> Make sure to *never* share your bot's token with anyone. In the wrong hands it
> could be used to do a variety of malicious acts! Store it somewhere safe, or
> generate a new one every time you need the token. Generating new token makes
> the previous one expired, so you have to restart the bot with the new one.

## Prepare database

Doorman uses [MongoDB](https://www.mongodb.com) to store various channel data
and configuration. Database is required for Doorman in order to function
properly, so below are instructions on how to prepare one.

1. [Register](https://account.mongodb.com/account/register) at MongoDB Atlas

2. Create a free **M0** shared cluster

3. At the **Security Quickstart** or **Database Access** page, create a database
   user with secure password

4. At the **Security Quickstart** or **Network Access** page, add `0.0.0.0` to
   IP access list to be able to connect from anywhere

5. Head over to **Overview** page and click the **Connect** button

6. Choose **Drivers** option

7. Copy the connection string and replace `<password>` with the actual database
   user password

The resulting connection string should look like this:
`mongodb+srv://john:S3curePa$$word@cluster0.etdwv87.mongodb.net/doorman`

Notice the `/doorman` part at the end. This will be the name of the database
used by Doorman in MongoDB cluster. You can rename it or even remove it, and in
that case Doorman will use database named `doorman` by default. The database
will be created automatically if it's missing. Changing the name in the
connection string won't rename an existing database, but create a new one next
to the old one.

> [!NOTE]
> The connection string you copy will most likely contain something like
> `?retryWrites=true&w=majority` at the end. You can safely strip this part if
> you want, as the options it specifies are set internally by Doorman anyway.

## Run locally

1. Install Node.js and npm following [this guide][node-guide]

2. [Download][download-repo] this repository or clone it using `git`

```sh
git clone https://github.com/udxf/doorman.git
cd doorman
```

Note that you have to execute next steps from within the **doorman** folder.

3. Install all dependencies

```sh
npm i
```

4. Compile the bot to JavaScript

```sh
npm run build
```

5. Run the bot, specifying **`TOKEN`** and **`DATABASE`** environment variables

```sh
TOKEN=<bot_token> DATABASE=<mongodb_uri> npm run start
```

Replace `<bot_token>` with the actual bot token, and `<mongodb_uri>` with the
MongoDB connection string.

## Deploy onto a hosting

Process of deploying may vary depending on a hosting provider, so you should
follow hosting-specific documentation to deploy everything the right way. The
most important part here is to upload the source code and specify **`TOKEN`**
and **`DATABASE`** environment variables at the hosting.

Make sure the hosting supports Node.js applications. Don't pay for it without a
free trial if you're not sure whether it can host Doorman or not.

Official instance of Doorman runs on [Fly.io](https://fly.io). You can choose a
different hosting provider if desired.

[invitation]: https://discord.com/api/oauth2/authorize?client_id=1073645118395002960&permissions=286262288&scope=bot%20applications.commands
[create-bot]: https://discord.com/developers/applications?new_application=true
[node-guide]: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
[download-repo]: https://github.com/udxf/doorman/archive/refs/heads/main.zip
