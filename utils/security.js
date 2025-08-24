import config from "../config/config.json" assert { type: "json" };
import msgs from "./config/messages.json";  

const spamCache = new Map();

function detectLink(text) {
  if (!text) return false;
  const re = /(https?:\/\/|wa\.me\/|chat\.whatsapp\.com\/|t\.me\/|discord\.gg\/|bit\.ly\/)/i;
  return re.test(text);
}

function detectBugPayload(text) {
  if (!text) return false;
  // Heuristics: extremely long repeated characters, massive zero-width chars, etc.
  if (text.length > 3000) return true;
  const zeroWidth = /[\u200B-\u200F\uFEFF\u202A-\u202E]/g;
  const bomb = /(.)\1{50,}/; // 50+ repeats of same char
  return zeroWidth.test(text) || bomb.test(text);
}

function trackSpam(jid, sender) {
  const key = `${jid}:${sender}`;
  const win = config.limits.spamWindowMs;
  const max = config.limits.spamMaxMsgs;

  const now = Date.now();
  let arr = spamCache.get(key) || [];
  arr = arr.filter(ts => now - ts < win);
  arr.push(now);
  spamCache.set(key, arr);
  return arr.length > max;
}

export async function applySecurityGuards({ sock, m, config, msgs, DB }) {
  const jid = m.key.remoteJid;
  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    "";

  // Ignore from self
  if (m.key.fromMe) return false;

  const isGroup = jid.endsWith("@g.us");

  // Mutes
  if (isGroup && DB.isMuted(jid, m.key.participant || m.key.remoteJid)) {
    // delete message if bot is admin
    try { await sock.sendMessage(jid, { delete: m.key }); } catch {}
    return true;
  }

  // Raid mode: block non-admin joins handled in events; here we could restrict messages if needed.

  // Antilink
  const antilink = isGroup ? (DB.getToggle(jid, "antilink") ?? config.features.antilink) : false;
  if (antilink && detectLink(text)) {
    const user = m.key.participant || m.key.remoteJid;
    const count = DB.addWarning(jid, user); await DB.save();
    await sock.sendMessage(jid, { text: `${msgs.antilinkWarn}\n${msgs.warned.replace("{user}", user.split("@")[0]).replace("{a}", String(count)).replace("{b}", String(config.limits.warningsBeforeKick))}` }, { quoted: m });
    if (count >= config.limits.warningsBeforeKick) {
      try { await sock.groupParticipantsUpdate(jid, [user], "remove"); } catch {}
      await sock.sendMessage(jid, { text: msgs.autokick.replace("{user}", user.split("@")[0]).replace("{n}", String(count)) });
    }
    return true;
  }

  // Antibug
  const antibug = (isGroup ? (DB.getToggle(jid, "antibug") ?? config.features.antibug) : config.features.antibug);
  if (antibug && detectBugPayload(text)) {
    try { await sock.sendMessage(jid, { delete: m.key }); } catch {}
    await sock.sendMessage(jid, { text: msgs.antibugBlocked }, { quoted: m });
    return true;
  }

  // Antispam
  const antispam = isGroup ? (DB.getToggle(jid, "antispam") ?? config.features.antispam) : config.features.antispam;
  if (antispam && trackSpam(jid, m.key.participant || m.key.remoteJid)) {
    // soft action: warn
    const user = m.key.participant || m.key.remoteJid;
    const count = DB.addWarning(jid, user); await DB.save();
    await sock.sendMessage(jid, { text: `🧹 Spam detected.\n${msgs.warned.replace("{user}", user.split("@")[0]).replace("{a}", String(count)).replace("{b}", String(config.limits.warningsBeforeKick))}` }, { quoted: m });
    if (count >= config.limits.warningsBeforeKick) {
      try { await sock.groupParticipantsUpdate(jid, [user], "remove"); } catch {}
      await sock.sendMessage(jid, { text: msgs.autokick.replace("{user}", user.split("@")[0]).replace("{n}", String(count)) });
    }
    return true;
  }

  return false;
}
