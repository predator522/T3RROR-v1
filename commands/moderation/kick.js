export default {
  name: "kick",
  category: "Moderation",
  description: "Kick a user",
  groupOnly: true, adminOnly: true, needsBotAdmin: true,
  async run({ sock, m, ctx, msgs }) {
    const jid = m.key.remoteJid;
    const user = (ctx.args[0] || (m.message?.extendedTextMessage?.contextInfo?.participant)) || "";
    if (!user) return await sock.sendMessage(jid, { text: "Tag or specify a user." }, { quoted: m });
    const full = user.replace(/[^\d+]/g, "") + "@s.whatsapp.net";
    try { await sock.groupParticipantsUpdate(jid, [full], "remove"); } catch {}
    await sock.sendMessage(jid, { text: msgs.kicked.replace("{user}", full.split("@")[0]) }, { quoted: m });
  }
};
