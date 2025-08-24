export default {
  name: "unmute",
  category: "Moderation",
  description: "Unmute a user",
  groupOnly: true, adminOnly: true,
  async run({ sock, m, ctx, DB, msgs }) {
    const jid = m.key.remoteJid;
    const user = (ctx.args[0] || (m.message?.extendedTextMessage?.contextInfo?.participant));
    if (!user) return await sock.sendMessage(jid, { text: "Usage: .unmute @user" }, { quoted: m });
    const full = user.replace(/[^\d+]/g, "") + "@s.whatsapp.net";
    DB.unmute(jid, full); await DB.save();
    await sock.sendMessage(jid, { text: msgs.unmuted.replace("{user}", full.split("@")[0]) }, { quoted: m });
  }
};
