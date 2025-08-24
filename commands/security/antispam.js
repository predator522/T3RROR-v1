export default {
  name: "antispam",
  category: "Security",
  description: "Toggle antispam in this group",
  groupOnly: true, adminOnly: true,
  async run({ sock, m, ctx, DB }) {
    const jid = m.key.remoteJid;
    const arg = (ctx.args[0] || "").toLowerCase();
    if (!arg) return await sock.sendMessage(jid, { text: "Usage: .antispam on/off" }, { quoted: m });
    DB.setToggle(jid, "antispam", arg === "on"); await DB.save();
    await sock.sendMessage(jid, { text: `🧹 Antispam ${arg === "on" ? "enabled" : "disabled"}.` }, { quoted: m });
  }
};
