export default {
  name: "resetwarn",
  category: "Moderation",
  description: "Reset warnings for a user",
  groupOnly: true, adminOnly: true,
  async run({ sock, m, ctx, DB }) {
    const jid = m.key.remoteJid;
    const user = (ctx.args[0] || (m.message?.extendedTextMessage?.contextInfo?.participant)) || "";
    if (!user) return await sock.sendMessage(jid, { text: "Tag or specify a user." }, { quoted: m });
    const full = user.replace(/[^\d+]/g, "") + "@s.whatsapp.net";
    DB.resetWarnings(jid, full); await DB.save();
    await sock.sendMessage(jid, { text: `✅ Warnings reset for ${user.split("@")[0]}.` }, { quoted: m });
  }
};
