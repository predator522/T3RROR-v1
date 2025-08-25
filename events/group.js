import { config } from "./config/index.js";

console.log(config.botName); // example usage
import msgs from "./config/messages.json";  

export async function onGroupParticipantsUpdate({ sock, ev, config: cfg, msgs, DB }) {
  const { id: jid, action, participants } = ev;
  if (!jid?.endsWith("@g.us")) return;

  const welcomeOn = DB.getToggle(jid, "welcome");
  const goodbyeOn = DB.getToggle(jid, "goodbye");

  for (const u of participants) {
    const mention = [u];
    if (action === "add" && (welcomeOn ?? config.features.welcome)) {
      const meta = await sock.groupMetadata(jid);
      const count = meta.participants.length;
      await sock.sendMessage(jid, {
        text: msgs.welcome.replace("{user}", u.split("@")[0]).replace("{count}", String(count)),
        mentions: mention
      });
    }
    if ((action === "remove" || action === "leave") && (goodbyeOn ?? config.features.goodbye)) {
      await sock.sendMessage(jid, {
        text: msgs.goodbye.replace("{user}", u.split("@")[0]),
        mentions: mention
      });
    }
  }
}
