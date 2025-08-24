export default {
  name: "demote",
  category: "Moderation",
  description: "Demote admin to member",
  groupOnly: true, adminOnly: true, needsBotAdmin: true,
  async run({ sock, m, ctx, msgs }) {
    const jid = m.key.remoteJid;
    const user = (ctx.args[0] || (m.message?.extendedTextMessage?.contextInfo?.
