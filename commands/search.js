const FuzzySearch = require("fuzzy-search");
const { MessageEmbed, Formatters, MessageButton } = require("discord.js");

module.exports = {
  name: ["search"],
  description: "search for an item from platinumgod",
  options: [{ name: "query", type: "STRING", description: "get info about an item", required: true }],
  async execute(interaction) {
    const searcher = new FuzzySearch(interaction.client.itemList);
    const query = interaction.options.get("query").value;
    const result = searcher.search(query, [], { sort: true });

    if (result.length) {
      const itemName = result[0];
      const item = interaction.client.items.get(itemName);

      let color;
      if (item.isItem) {
        color = "#4f92ff";
      } else if (item.isTrinket) {
        color = "#ffec45";
      } else if (item.isCard) {
        color = "#ff4545";
      } else {
        color = "#5445ff";
      }

      let description = [Formatters.bold(item.pickup), item.description, item.info, item.quality].join("\n\n");

      const embed = new MessageEmbed().setTitle(item.name).setColor(color).setDescription(description);

      embed.setAuthor(item.id);

      if (item.unlock) embed.addField("Unlock", `||${item.unlock}||`, true);

      if (item.isItem || item.isTrinket) {
        const urlButton = new MessageButton({
          label: "View Wiki",
          style: "LINK",
          url: `https://bindingofisaacrebirth.fandom.com/wiki/${encodeURIComponent(item.name)}`,
          emoji: "📖",
        });
        interaction.reply({ embeds: [embed], ephemeral: true, components: [{ type: 1, components: [urlButton] }] });
      } else interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      interaction.reply({ content: "🚫 **No result found.**", ephemeral: true });
    }
  },
};
