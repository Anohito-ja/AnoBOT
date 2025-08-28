const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // 既存のデータファイルをロード
    client.settings = client.loadData('settings', {});
    client.bannedWords = client.loadData('bannedWords', []);
    client.warnings = client.loadData('warnings', {});
    client.gameStates = client.loadData('gameStates', {});

    console.log('Bot is online and ready.');
  },
};
