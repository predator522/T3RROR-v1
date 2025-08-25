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
import { onGroupParticipantsUpdate } from "./events/group.js";
import { applySecurityGuards } from "./utils/security.js";
import DB from "./utils/database.js";

// ⬇️ Fix JSON imports with dynamic import
import { config } from "./config/index.js";

console.log(config.botName); // example usage
const msgs   = await import("./config/messages.json", { assert: { type: "json" } }).then(m => m.default);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(chalk.red(figlet.textSync(config.botName, { horizontalLayout: "fitted" })));
console.log(chalk.gray(`v${config.version} | prefix: ${config.prefix} | owner: ${config.ownerAlias}\n`));
