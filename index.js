require("dotenv").config();
const { Client } = require("discord.js");
const fetchItems = require("./fetch-items");

const client = new Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
  failIfNotExists: false,
});

client.once("ready", async () => {
  console.log(`Bot is online`);

  fetchItems(client);

  if (!client.application?.owner) await client.application?.fetch();

  const commandHandler = require("./commands/command-handler");
  commandHandler(client);
});

client.login(process.env.TOKEN);
