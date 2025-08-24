export default {
  name: "promote",
  category: "Moderation",
  description: "Promote user to admin",
  groupOnly: true, adminOnly: true, needsBotAdmin: true,
  async run({ sock, m, ctx, msgs }) {
    const jid = m.key.remoteJid;
    const user = (ctx.args[0] || (m.message?.extendedTextMessage?.contextInfo?.participant));
    if (!user) return await sock.sendMessage(jid, { text: "Usage: .promote @user" }, { quoted: m });
    const full = user.replace(/[^\d+]/g, "") + "@s.whatsapp.net";
    try { await sock.groupParticipantsUpdate(jid, [full], "promote"); } catch {}
    await sock.sendMessage(jid, { text: msgs.promoted.replace("{user}", full.split("@")[0]) }, { quoted: m });
  }
};
