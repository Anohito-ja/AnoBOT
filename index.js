const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
const fs = require('fs');
const path = require('path');
const figlet = require('figlet');
require('dotenv').config();

const app = express();
const port = 3000;

// Discordクライアントの作成
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// コマンドとデータを格納するコレクションを初期化
client.commands = new Collection();
client.cooldowns = new Collection();
client.settings = {};
client.bannedWords = [];
client.warnings = {};
client.gameStates = {};

// データをロードする関数
client.loadData = (file, defaultValue) => {
  const filePath = path.join(__dirname, 'data', `${file}.json`);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.error(`Error parsing ${file}.json:`, e);
      return defaultValue;
    }
  }
  return defaultValue;
};

// データを保存する関数
client.saveData = (file) => {
  const filePath = path.join(__dirname, 'data', `${file}.json`);
  fs.writeFileSync(filePath, JSON.stringify(client[file], null, 2), 'utf-8');
};

// コマンドを読み込む
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    if (file === 'werewolf_game_logic.js' || file === 'index.js') {
      continue;
    }
    
    try {
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    } catch (e) {
      console.error(`Error loading command file ${filePath}:`, e);
    }
  }
}

// イベントを読み込む
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  try {
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  } catch (e) {
    console.error(`Error loading event file ${filePath}:`, e);
  }
}

// 音楽プレイヤーのイベントを扱う
const { playerEvents } = require('./playerEvents.js');
playerEvents(client);

// Webサーバー
app.get('/', (req, res) => {
  res.send('Discord bot is online!');
});

app.listen(port, () => {
  console.log(`Web server listening at http://localhost:${port}`);
});

// Discordにログイン
client.login(process.env.DISCORD_TOKEN);

figlet.text('Bot is starting...', {
  font: 'Standard',
  horizontalLayout: 'default',
  verticalLayout: 'default',
}, (err, data) => {
  if (err) {
    console.log('Something went wrong...');
    console.dir(err);
    return;
  }
  console.log(data);
});
