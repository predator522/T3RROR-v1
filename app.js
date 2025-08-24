import makeWASocket, { useMultiFileAuthState, Browsers } from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs-extra";
import path from "path";
import readlineSync from "readline-sync";
import figlet from "figlet";
import chalk from "chalk";
import { fileURLToPath } from "url";
import { loadCommands, getCommand, listCategories } from "./lib/commandLoader.js";
import { parseMessage, isUserAdmin, isBotAdmin, jidToNumber } from "./lib/context.js";
import config from "./config/config.json" assert { type: "json" };
import msgs from "./config/messages.json" assert { type: "json" };
import { onGroupParticipantsUpdate } from "./events/group.js";
import { applySecurityGuards } from "./utils/security.js";
import DB from "./utils/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(chalk.red(figlet.textSync(config.botName, { horizontalLayout: "fitted" })));
console.log(chalk.gray(`v${config.version} | prefix: ${config.prefix} | owner: ${config.ownerAlias}\n`));

await fs.ensureDir("./sessions");
await fs.ensureDir("./assets");
await fs.ensureDir("./commands");

const registry = await loadCommands();
const logger = pino({ level: "silent" });
const { state, saveCreds } = await useMultiFileAuthState("./sessions");

const sock = makeWASocket({
  logger,
  auth: state,
  printQRInTerminal: false,
  browser: Browsers.macOS("Chrome"),
  syncFullHistory: false
});

sock.ev.on("creds.update", saveCreds);

// Connection / pairing
sock.ev.on("connection.update", async (update) => {
  const { connection, lastDisconnect } = update;
  if (connection === "open") {
    console.log(chalk.green(msgs.startupBanner.replace("{owner}", config.ownerAlias)));
  }
  if (connection === "close") {
    const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.message || "unknown";
    console.log(chalk.yellow(`⚠️ Connection closed (${reason}). Reconnecting…`));
  }
});

(async () => {
  if (!state?.creds?.registered) {
    let number = process.env.WA_NUMBER;
    if (!number) {
      console.log(chalk.gray(msgs.noEnvNumber));
      number = readlineSync.question(chalk.cyan(`${msgs.pairingPrompt} `));
    }
    number = String(number || "").trim();
    if (!number.startsWith("+")) {
      console.log(chalk.red("❌ Number must include country code, e.g. +233XXXXXXXXX"));
      process.exit(1);
    }
    try {
      const code = await sock.requestPairingCode(number);
      console.log(chalk.green(msgs.pairingCodeMsg.replace("{number}", number).replace("{code}", code)));
    } catch (e) {
      console.error(chalk.red("Failed to get Pairing Code:"), e?.message || e);
      process.exit(1);
    }
  }
})();

// Events
sock.ev.on("group-participants.update", async (ev) => {
  try {
    await onGroupParticipantsUpdate({ sock, ev, config, msgs, DB });
  } catch (e) {
    console.error("group event error:", e);
  }
});

// Messages
sock.ev.on("messages.upsert", async ({ messages }) => {
  const m = messages?.[0];
  if (!m || !m.message) return;

  // SECURITY GUARDS (antilink / antibug / antispam / raidmode)
  try {
    const blocked = await applySecurityGuards({ sock, m, config, msgs, DB });
    if (blocked) return; // message handled/blocked
  } catch (e) {
    console.error("security guards error:", e);
  }

  // Parse & commands
  const ctx = parseMessage(m, config.prefix);
  if (!ctx.isCmd) return;

  const cmd = getCommand(registry, ctx.command);
  if (!cmd) {
    await sock.sendMessage(ctx.chatId, { text: msgs.unknownCmd.replace("{cmd}", ctx.command) }, { quoted: m });
    return;
  }

  // owner-only
  if (cmd.ownerOnly) {
    const isOwner = ctx.isFromOwner(config.owners);
    if (!isOwner) return await sock.sendMessage(ctx.chatId, { text: msgs.notOwner }, { quoted: m });
  }

  // group admin / bot admin checks if command requests them
  if (cmd.groupOnly && !ctx.isGroup) return;
  if (cmd.adminOnly && ctx.isGroup && !(await isUserAdmin(sock, ctx.chatId, ctx.sender))) {
    return await sock.sendMessage(ctx.chatId, { text: msgs.notAdmin }, { quoted: m });
  }
  if (cmd.needsBotAdmin && ctx.isGroup && !(await isBotAdmin(sock, ctx.chatId))) {
    return await sock.sendMessage(ctx.chatId, { text: msgs.botNotAdmin }, { quoted: m });
  }

  try {
    await cmd.run({ sock, m, ctx, config, msgs, registry, DB });
  } catch (err) {
    console.error("Command error:", err);
    await sock.sendMessage(ctx.chatId, { text: "❌ Command failed. Check logs." }, { quoted: m });
  }
});
