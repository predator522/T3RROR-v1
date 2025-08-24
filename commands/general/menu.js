import cfg from "../../config/config.json" assert { type: "json" };
import msgs from "../../config/messages.json" assert { type: "json" };
import { listCategories } from "../../lib/commandLoader.js";

export default {
  name: "menu",
  category: "General",
  description: "Show command categories or expand a category",
  aliases: ["help"],
  async run({ sock, m, ctx, registry }) {
    const cat = (ctx.args[0] || "").toLowerCase();
    if (!cat) {
      const caption = msgs.menuHeader.replace("{bot}", cfg.botName).replace("{prefix}", cfg.prefix).replace("{owner}", cfg.ownerAlias)
        + "\n" + msgs.menuHint.replace(/{prefix}/g, cfg.prefix);
      await sock.sendMessage(ctx.chatId, { text: caption }, { quoted: m });
      return;
    }
    const map = listCategories(registry);
    const foundKey = Object.keys(map).find(k => k.toLowerCase() === cat);
    if (!foundKey) return await sock.sendMessage(ctx.chatId, { text: `❌ Unknown category: ${cat}` }, { quoted: m });
    const cmds = map[foundKey].sort().map(n => `${cfg.prefix}${n}`).join("\n");
    await sock.sendMessage(ctx.chatId, { text: `📂 ${foundKey} Commands\n\n${cmds}` }, { quoted: m });
  }
};
