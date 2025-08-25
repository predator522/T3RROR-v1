import { config } from "../config/index.js";

export default {
  name: "warn",
  category: "Moderation",
  description: "Warn a user (3 = kick)",
  groupOnly: true, adminOnly: true, needsBotAdmin: true,
  async run({ sock, m, ctx, DB, msgs }) {
    const jid = m.key.remoteJid;
    const target = ctx.args[0];
    const user = target?.replace(/[^\d+]/g, "") + "@s.whatsapp.net" || (m.message?.extendedTextMessage?.contextInfo?.participant);
    if (!user) return await sock.sendMessage(jid, { text: "Tag or specify a user." }, { quoted: m });
    const count = DB.addWarning(jid, user); await DB.save();
    await sock.sendMessage(jid, { text: msgs.warned.replace("{user}", user.split("@")[0]).replace("{a}", String(count)).replace("{b}", String(config.limits.warningsBeforeKick)) }, { quoted: m });
    if (count >= config.limits.warningsBeforeKick) {
      try { await sock.groupParticipantsUpdate(jid, [user], "remove"); } catch {}
      await sock.sendMessage(jid, { text: msgs.autokick.replace("{user}", user.split("@")[0]).replace("{n}", String(count)) });
    }
  }
};
