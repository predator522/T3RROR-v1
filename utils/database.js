import fs from "fs-extra";

class DB {
  constructor(file = "./data/database.json") {
    this.file = file;
    this.data = { users: {}, groups: {}, bans: {} };
  }
  async load() {
    if (await fs.pathExists(this.file)) this.data = await fs.readJson(this.file);
    else await this.save();
  }
  async save() { await fs.writeJson(this.file, this.data, { spaces: 2 }); }

  // warnings
  getWarnings(jid, user) {
    const g = this.data.groups[jid] ||= { warnings: {}, settings: {}, mutes: {}, raidmode: false };
    return g.warnings[user] || 0;
  }
  addWarning(jid, user) {
    const g = this.data.groups[jid] ||= { warnings: {}, settings: {}, mutes: {}, raidmode: false };
    g.warnings[user] = (g.warnings[user] || 0) + 1; return g.warnings[user];
  }
  resetWarnings(jid, user) {
    const g = this.data.groups[jid] ||= { warnings: {}, settings: {}, mutes: {}, raidmode: false };
    g.warnings[user] = 0;
  }

  // mutes
  setMute(jid, user, untilTs) {
    const g = this.data.groups[jid] ||= { warnings: {}, settings: {}, mutes: {}, raidmode: false };
    g.mutes[user] = untilTs;
  }
  isMuted(jid, user) {
    const g = this.data.groups[jid] ||= { warnings: {}, settings: {}, mutes: {}, raidmode: false };
    const ts = g.mutes[user]; if (!ts) return false; if (Date.now() > ts) { delete g.mutes[user]; return false; }
    return true;
  }
  unmute(jid, user) {
    const g = this.data.groups[jid] ||= { warnings: {}, settings: {}, mutes: {}, raidmode: false };
    delete g.mutes[user];
  }

  // toggles
  setToggle(jid, key, val) {
    const g = this.data.groups[jid] ||= { warnings: {}, settings: {}, mutes: {}, raidmode: false };
    g.settings[key] = !!val;
  }
  getToggle(jid, key) {
    const g = this.data.groups[jid] ||= { warnings: {}, settings: {}, mutes: {}, raidmode: false };
    if (g.settings[key] === undefined) return null;
    return !!g.settings[key];
  }

  // raid mode
  setRaid(jid, val) { const g = this.data.groups[jid] ||= { warnings: {}, settings: {}, mutes: {}, raidmode: false }; g.raidmode = !!val; }
  getRaid(jid) { const g = this.data.groups[jid] ||= { warnings: {}, settings: {}, mutes: {}, raidmode: false }; return !!g.raidmode; }
}

const instance = new DB();
await instance.load();
export default instance;
