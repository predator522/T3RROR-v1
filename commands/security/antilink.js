export default {
  name: "antilink",
  category: "Security",
  description: "Toggle antilink in this group",
  groupOnly: true, adminOnly: true,
  async run({ sock, m, ctx, DB }) {
    const jid = m.key.remoteJid;
    const arg = (ctx.args[0] || "").toLowerCase();
    if (!arg) return await sock.sendMessage(jid, { text: "Usage: .antilink on/off" }, { quoted: m });
    DB.setToggle(jid, "antilink", arg === "on"); await DB.save();
    await sock.sendMessage(jid, { text: `🔗 Antilink ${arg === "on" ? "enabled" : "disabled"}.` }, { quoted: m });
  }
};
