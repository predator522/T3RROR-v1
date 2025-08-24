export default {
  name: "raidmode",
  category: "Security",
  description: "Lock/unlock group joins",
  groupOnly: true, adminOnly: true,
  async run({ sock, m, ctx, DB }) {
    const jid = m.key.remoteJid;
    const arg = (ctx.args[0] || "").toLowerCase();
    if (!["on","off"].includes(arg)) return await sock.sendMessage(jid, { text: "Usage: .raidmode on/off" }, { quoted: m });
    DB.setRaid(jid, arg === "on"); await DB.save();
    await sock.sendMessage(jid, { text: arg === "on" ? "🚫 RAID MODE ACTIVATED" : "✅ Raid mode disabled" }, { quoted: m });
  }
};
