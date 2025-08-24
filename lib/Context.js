export function parseMessage(m, prefix) {
  const chatId = m.key.remoteJid;
  const fromMe = m.key.fromMe === true;
  const sender = m.key.participant || m.key.remoteJid;
  const body =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    "";

  const isCmd = typeof body === "string" && body.trim().startsWith(prefix);
  let command = "", args = [];
  if (isCmd) {
    const sliced = body.trim().slice(prefix.length).trim();
    args = sliced.split(/\s+/);
    command = (args.shift() || "").toLowerCase();
  }

  const plainNumber = (jid) => (jid || "").replace(/[^0-9+]/g, "").replace(/(\d+).*/, "$1");
  const isFromOwner = (owners) => {
    const senderNum = "+" + plainNumber(sender);
    return owners.some((o) => o.replace(/\s+/g, "") === senderNum);
  };

  return { chatId, sender, fromMe, body, isCmd, command, args, isGroup: chatId?.endsWith("@g.us"), isFromOwner };
}

export async function isUserAdmin(sock, jid, participantJid) {
  const meta = await sock.groupMetadata(jid);
  const admins = meta.participants.filter(p => p.admin).map(p => p.id);
  return admins.includes(participantJid);
}

export async function isBotAdmin(sock, jid) {
  const meta = await sock.groupMetadata(jid);
  const me = (await sock.user.id).split(":")[0] + "@s.whatsapp.net";
  const admins = meta.participants.filter(p => p.admin).map(p => p.id);
  return admins.includes(me);
}

export function jidToNumber(jid) {
  return "+" + String(jid || "").replace(/[^\d+]/g, "").replace(/(\d+)@.*/, "$1");
}
