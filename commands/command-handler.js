const path = require("path");
const fs = require("fs");
const handlerFile = "command-handler.js";
const { Collection } = require("discord.js");

module.exports = client => {
  client.commands = new Collection();

  // recursively read js files in each folder
  const readFiles = async (dir, collection) => {
    const files = fs.readdirSync(path.join(__dirname, dir));
    for (const file of files) {
      const stat = fs.lstatSync(path.join(__dirname, dir, file));
      if (stat.isDirectory()) {
        readFiles(path.join(dir, file), collection);
      } else if (file !== handlerFile && file.endsWith(".js")) {
        const command = require(path.join(__dirname, dir, file));
        const { name, required_perms = [] } = command;

        const category = path.basename(path.dirname(path.join(__dirname, dir, file)));
        command.category = category;

        if (typeof name === "string") command.name = [name];
        if (typeof required_perms === "string") command.required_perms = [required_perms];
        collection.set(command.name[0] ?? file, command);
      }
    }
  };

  readFiles("", client.commands);

  client.on("messageCreate", async message => {
    if (message.author.id !== client.application.owner.id) {
      return;
    }

    // deploy commands to current guild
    if (message.content.toLowerCase() === "!deploy") {
      const slashCommands = client.commands.map(command => {
        let { name, description = "missing description", options = [] } = command;
        if (typeof name === "string") name = [name];
        const cmd = { name: name[0], description, options, type: "CHAT_INPUT" };
        return cmd;
      });

      console.log(`Deploying ${slashCommands.length} commands to "${message.guild.name}"`);
      message.guild.commands.set(slashCommands);
    }

    // deploy commands to all guilds
    if (message.content.toLowerCase() === "!global") {
      const slashCommands = client.commands.map(command => {
        let { name, description = "missing description", options = [] } = command;
        if (typeof name === "string") name = [name];
        const cmd = { name: name[0], description, options, type: "CHAT_INPUT" };
        return cmd;
      });
      console.log(`Deployed ${slashCommands.length} globally`);
      client.application.commands.set(slashCommands);
    }
  });

  client.on("interactionCreate", async interaction => {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      const { name, execute } = command;

      const currentTime = new Date().toTimeString().split(" ")[0];
      const options = interaction.options._hoistedOptions.map(option => `${option.name}: ${option.value}`);
      console.log(`[${currentTime}] ${interaction.user.tag} used /${name[0]} ${options.join(", ")}`);

      execute(interaction).catch(error => {
        console.error(error);
        !interaction.deferred
          ? interaction.reply({ content: "🚫 **An error occurred.**", ephemeral: true })
          : interaction.followUp({ content: "🚫 **An error occurred.**", ephemeral: true });
      });
    }
  });
};
