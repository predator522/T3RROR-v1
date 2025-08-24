export default {
  name: "demote",
  category: "Moderation",
  description: "Demote admin to member",
  groupOnly: true, adminOnly: true, needsBotAdmin: true,
  async run({ sock, m, ctx, msgs }) {
    const jid = m.key.remoteJid;
    const user = (ctx.args[0] || (m.message?.extendedTextMessage?.contextInfo?.participant));
    if (!user) return await sock.sendMessage(jid, { text: "Usage: .demote @user" }, { quoted: m });
    const full = user.replace(/[^\d+]/g, "") + "@s.whatsapp.net";
    try { await sock.groupParticipantsUpdate(jid, [full], "demote"); } catch {}
    await sock.sendMessage(jid, { text: msgs.demoted.replace("{user}", full.split("@")[0]) }, { quoted: m });
  }
};
