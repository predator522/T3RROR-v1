import { config } from "../config/index.js";

export default {
  name: "owner",
  category: "System",
  description: "Show bot owner alias (no number)",
  async run({ sock, m }) {
    await sock.sendMessage(m.key.remoteJid, { text: `👑 Owner: ${cfg.ownerAlias}\n🔒 Number: Hidden` }, { quoted: m });
  }
};
