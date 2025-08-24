import ms from "./ms.js"; // tiny parser below

export default {
  name: "mute",
  category: "Moderation",
  description: "Mute a user for time (e.g. 10m, 1h)",
  groupOnly: true, adminOnly: true,
  async run({ sock, m, ctx, DB, msgs }) {
    const jid = m.key.remoteJid;
    const user = (ctx.args[0] || (m.message?.extendedTextMessage?.contextInfo?.participant));
    const time = ctx.args[1] || "10m";
    if (!user) return await sock.sendMessage(jid, { text: "Usage: .mute @user 10m" }, { quoted: m });
    const full = user.replace(/[^\d+]/g, "") + "@s.whatsapp.net";
    const until = Date.now() + ms(time);
    DB.setMute(jid, full, until); await DB.save();
    await sock.sendMessage(jid, { text: msgs.muted.replace("{user}", full.split("@")[0]).replace("{time}", time) }, { quoted: m });
  }
};
