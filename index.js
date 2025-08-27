const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
require('dotenv').config();

const app = express();
const port = 3000;

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

client.commands = new Collection();
client.cooldowns = new Collection();
client.settings = {};
client.bannedWords = [];
client.warnings = {};
client.gameStates = {};

// データファイルをロード
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

// データを保存
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
    
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

// 音楽プレイヤーのイベントを扱う
const { playerEvents } = require('./playerEvents.js');
playerEvents(client);

// データを初期化
client.once('ready', () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
  
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  client.settings = client.loadData('settings', {});
  client.bannedWords = client.loadData('bannedWords', []);
  client.warnings = client.loadData('warnings', {});
  client.gameStates = client.loadData('gameStates', {});

  console.log('Bot is online and ready.');
});

// コマンド実行時の処理
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'コマンドの実行中にエラーが発生しました。', flags: 64 });
    } else {
      await interaction.reply({ content: 'コマンドの実行中にエラーが発生しました。', flags: 64 });
    }
  }
});

// メッセージが送信されたときの処理
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const isBannedWord = Array.isArray(client.bannedWords) && client.bannedWords.some(word => message.content.includes(word));
  if (isBannedWord) {
    await message.delete();
    const replyMessage = await message.channel.send({ content: `${message.author} さん、禁止ワードが含まれています。`, flags: 64 });
    setTimeout(() => replyMessage.delete(), 5000);
  }

  // 画像専用チャンネルのチェック
  if (Array.isArray(client.settings.imageChannels) && client.settings.imageChannels.includes(message.channel.id)) {
    if (message.attachments.size === 0) {
      await message.delete();
    }
  }

  // リンク禁止チャンネルのチェック
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  if (Array.isArray(client.settings.linkRestrictChannels) && client.settings.linkRestrictChannels.includes(message.channel.id)) {
    if (urlRegex.test(message.content)) {
      await message.delete();
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
