import fs from "fs-extra";
import { config } from "./config/index.js";

console.log(config.botName); // example usage

export default {
  name: "prefix",
  category: "System",
  description: "Show or change prefix (owner only)",
  ownerOnly: true,
  async run({ sock, m, ctx }) {
    const chatId = m.key.remoteJid;
    const newPrefix = (ctx.args[0] || "").trim();
    if (!newPrefix) return await sock.sendMessage(chatId, { text: `Current prefix: \`${cfg.prefix}\`\nUsage: ${cfg.prefix}prefix <symbol>` }, { quoted: m });
    if (newPrefix.length > 2) return await sock.sendMessage(chatId, { text: "❌ Prefix should be 1–2 characters." }, { quoted: m });
    cfg.prefix = newPrefix; await fs.writeJson("./config/config.json", cfg, { spaces: 2 });
    await sock.sendMessage(chatId, { text: `✅ Prefix changed to \`${cfg.prefix}\`` }, { quoted: m });
  }
};
