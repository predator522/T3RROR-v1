export default {
  name: "warnings",
  category: "Moderation",
  description: "Show warnings for a user",
  groupOnly: true, adminOnly: true,
  async run({ sock, m, ctx, DB }) {
    const jid = m.key.remoteJid;
    const user = (ctx.args[0] || (m.message?.extendedTextMessage?.contextInfo?.participant)) || "";
    if (!user) return await sock.sendMessage(jid, { text: "Tag or specify a user." }, { quoted: m });
    const full = user.replace(/[^\d+]/g, "") + "@s.whatsapp.net";
    const count = DB.getWarnings(jid, full);
    await sock.sendMessage(jid, { text: `🔔 ${user.split("@")[0]} has ${count} warning(s).` }, { quoted: m });
  }
};
