export default {
  name: "ping",
  category: "General",
  description: "Check bot latency",
  async run({ sock, m }) {
    const start = Date.now();
    const sent = await sock.sendMessage(m.key.remoteJid, { text: "🏓 Pong..." }, { quoted: m });
    const ms = Date.now() - start;
    await sock.sendMessage(m.key.remoteJid, { edit: sent.key, text: `🏓 Pong! ${ms}ms` });
  }
};
