const { Collection } = require("discord.js");
const { JSDOM } = require("jsdom");
const got = require("got");

module.exports = async function (client) {
  const res = await got("https://platinumgod.co.uk/");
  const { document } = new JSDOM(res.body).window;

  const items = document.querySelectorAll("li.textbox");

  client.items = new Collection();
  client.itemList = [];

  items.forEach(item => {
    const name = item.querySelector("p.item-title").textContent;

    const id = item.querySelector("p.r-itemid")?.textContent;
    let idNumber;

    let isItem = false;
    let isTrinket = false;
    let isCard = false;

    if (id) {
      if (id.includes("Trinket")) {
        isTrinket = true;
        idNumber = id.replace("TrinketID: ", "");
      } else if (id.includes("Item")) {
        isItem = true;
        idNumber = id.replace("ItemID: ", "");
      } else if (id.includes("Card")) {
        isCard = true;
        idNumber = id.replace("CardID: ", "");
      }
    }

    const pickup = item.querySelector("p.pickup")?.textContent;
    const quality = item.querySelector("p.quality")?.textContent;
    const unlock = item.querySelector("p.r-unlock")?.textContent.replace("UNLOCK: ", "");
    const description = [...item.querySelectorAll("span > p:not([class])")].map(node => node.textContent).join("\n");

    const info = [...item.querySelectorAll("ul > p")].map(node => node.textContent).join("\n");

    client.itemList.push(name);
    client.items.set(name, {
      name,
      id,
      pickup,
      isItem,
      isTrinket,
      isCard,
      quality,
      unlock,
      description,
      info,
    });
  });
};
