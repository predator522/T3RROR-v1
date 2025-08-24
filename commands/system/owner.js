import cfg from "../../config/config.json" assert { type: "json" };

export default {
  name: "owner",
  category: "System",
  description: "Show bot owner alias (no number)",
  async run({ sock, m }) {
    await sock.sendMessage(m.key.remoteJid, { text: `👑 Owner: ${cfg.ownerAlias}\n🔒 Number: Hidden` }, { quoted: m });
  }
};
