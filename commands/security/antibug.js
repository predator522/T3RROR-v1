export default {
  name: "antibug",
  category: "Security",
  description: "Toggle antibug filter (group & private)",
  groupOnly: false, adminOnly: false,
  async run({ sock, m, ctx, DB }) {
    const jid = m.key.remoteJid;
    const arg = (ctx.args[0] || "").toLowerCase();
    if (!arg) return await sock.sendMessage(jid, { text: "Usage: .antibug on/off\n• In groups, setting is per-group.\n• In private, global setting in config is used." }, { quoted: m });
    if (jid.endsWith("@g.us")) {
      DB.setToggle(jid, "antibug", arg === "on"); await DB.save();
      return await sock.sendMessage(jid, { text: `⚡ Antibug ${arg === "on" ? "enabled" : "disabled"} for this group.` }, { quoted: m });
    }
    return await sock.sendMessage(jid, { text: "ℹ️ Private antibug is global via config.features.antibug." }, { quoted: m });
  }
};
