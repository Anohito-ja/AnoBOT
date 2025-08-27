require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits, Partials, Events, PermissionsBitField, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs-extra");
const path = require("path");
const play = require("play-dl");
const cron = require('node-cron');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");

// --- HTTP keep-alive ---
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (_req, res) => res.send("OK"));
app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.listen(PORT, () => console.log(`[web] listening on :${PORT}`));

// --- Bot クライアント ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions, // ここを追加
  ],
  partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction] // ここを修正
});

// --- コマンドとデータの初期化 ---
client.werewolfGame = null;
client.wordchainGame = null;
client.tictactoeGames = new Map();

// --- データ保存用 ---
const dataDir = path.join(__dirname, "data");
fs.ensureDirSync(dataDir);
const settingsFile = path.join(dataDir, "settings.json");
const xpFile = path.join(dataDir, "xp.json");
const warnFile = path.join(dataDir, "warnings.json");
const bannedWordsFile = path.join(dataDir, "banned.json");
const quizFile = path.join(dataDir, "quiz.json");
const ecoFile = path.join(dataDir, "economy.json");
const reactionRolesFile = path.join(dataDir, "reactionRoles.json"); // ここを追加

let settings = fs.readJsonSync(settingsFile, { throws: false }) || { logChannel: null, announcementChannel: null };
let xp = fs.readJsonSync(xpFile, { throws: false }) || {};
let warnings = fs.readJsonSync(warnFile, { throws: false }) || {};
let bannedWords = fs.readJsonSync(bannedWordsFile, { throws: false }) || [];
let quizzes = fs.readJsonSync(quizFile, { throws: false }) || [];
let economy = fs.readJsonSync(ecoFile, { throws: false }) || {};
let reactionRoles = fs.readJsonSync(reactionRolesFile, { throws: false }) || []; // ここを追加

// ヘルパー保存関数
const saveData = (file) => {
  switch(file) {
    case 'settings': fs.writeJsonSync(settingsFile, settings); break;
    case 'xp': fs.writeJsonSync(xpFile, xp); break;
    case 'warnings': fs.writeJsonSync(warnFile, warnings); break;
    case 'bannedWords': fs.writeJsonSync(bannedWordsFile, bannedWords); break;
    case 'quizzes': fs.writeJsonSync(quizFile, quizzes); break;
    case 'economy': fs.writeJsonSync(ecoFile, economy); break;
    case 'reactionRoles': fs.writeJsonSync(reactionRolesFile, reactionRoles); break; // ここを修正
  }
};
const saveAll = () => {
  fs.writeJsonSync(settingsFile, settings);
  fs.writeJsonSync(xpFile, xp);
  fs.writeJsonSync(warnFile, warnings);
  fs.writeJsonSync(bannedWordsFile, bannedWords);
  fs.writeJsonSync(quizFile, quizzes);
  fs.writeJsonSync(ecoFile, economy);
  fs.writeJsonSync(reactionRolesFile, reactionRoles); // ここを追加
};

// --- Bot Ready ---
client.once(Events.ClientReady, (c) => {
  console.log(`[bot] Logged in as ${c.user.tag}`);
  cron.schedule('0 9 * * *', () => {
    const channelId = settings.announcementChannel;
    if (channelId) {
        const channel = client.channels.cache.get(channelId);
        if (channel) {
            channel.send('📣 本日の定期イベントが開始されました！');
        }
    }
  });
});

// --- スラッシュコマンドとボタンインタラクションの処理 ---
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;
    
    // 人狼ゲーム中のプレイヤーのコマンド制限
    if (client.werewolfGame && client.werewolfGame.isActive && client.werewolfGame.state === 'playing') {
      const player = Array.from(client.werewolfGame.players.values()).find(p => p.id === interaction.user.id);
      if (player && !player.isAlive && commandName !== 'werewolf') {
          return interaction.reply({ content: '⚠️ あなたはゲーム中に死亡しているため、このコマンドは使用できません。', ephemeral: true });
      }
    }

    try {
      if (commandName === 'werewolf') {
        // 人狼ゲームのコマンド処理 (省略)
      } else if (commandName === 'profile') {
        // プロフィールカードのコマンド処理 (省略)
      } else if (commandName === 'tictactoe') {
        // 三目並べのコマンド処理 (省略)
      } else if (commandName === 'wordchain') {
        // しりとりゲームのコマンド処理 (省略)
      } else if (commandName === 'poll') {
        // 拡張投票機能のコマンド処理 (省略)
      } else if (commandName === 'reactionrole') {
        // リアクションロールのコマンド処理
        const roleId = interaction.options.getString('role_id');
        const emoji = interaction.options.getString('emoji');
        const description = interaction.options.getString('description') || 'リアクションをしてロールをゲットしよう！';
        const guild = interaction.guild;
        const role = guild.roles.cache.get(roleId);
        if (!role) {
          return interaction.reply({ content: '⚠️ 指定されたロールIDは無効です。', ephemeral: true });
        }
        const embed = new EmbedBuilder()
          .setTitle('リアクションロール')
          .setDescription(description)
          .addFields({ name: 'ロール', value: `<@&${role.id}>` })
          .setColor(role.color || 0x0099ff);
        const message = await interaction.channel.send({ embeds: [embed] });
        await message.react(emoji);
        const reactionRoleData = { messageId: message.id, roleId: role.id, emoji: emoji, };
        reactionRoles.push(reactionRoleData);
        saveData('reactionRoles');
        await interaction.reply({ content: '✅ リアクションロールメッセージが作成されました。', ephemeral: true });
      } else {
        await interaction.reply({ content: 'コマンドの実行中にエラーが発生しました！', ephemeral: true });
      }
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'コマンドの実行中にエラーが発生しました！', ephemeral: true });
      } else {
        await interaction.reply({ content: 'コマンドの実行中にエラーが発生しました！', ephemeral: true });
      }
    }
  } else if (interaction.isButton()) {
    // ボタンインタラクションの処理 (省略)
  }
});

// --- リアクションイベント処理 (ここを追記) ---
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Fetching reaction failed:', error);
      return;
    }
  }

  const reactionRole = reactionRoles.find(rr => rr.messageId === reaction.message.id && rr.emoji === reaction.emoji.name);
  if (reactionRole) {
    const member = reaction.message.guild.members.cache.get(user.id);
    if (member) {
      member.roles.add(reactionRole.roleId).catch(console.error);
    }
  }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
  if (user.bot) return;

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Fetching reaction failed:', error);
      return;
    }
  }

  const reactionRole = reactionRoles.find(rr => rr.messageId === reaction.message.id && rr.emoji === reaction.emoji.name);
  if (reactionRole) {
    const member = reaction.message.guild.members.cache.get(user.id);
    if (member) {
      member.roles.remove(reactionRole.roleId).catch(console.error);
    }
  }
});

// --- メッセージイベント処理 (省略) ---
client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot) return;

  // 各種メッセージ処理、接頭辞コマンド処理 (省略)
});

// --- 新規メンバー参加時の処理 (省略) ---
client.on(Events.GuildMemberAdd, member => {
  // 記念日通知 (省略)
});

client.login(process.env.DISCORD_TOKEN);

// --- ヘルパー関数群 (省略) ---
// ...

require("dotenv").config();
const fs = require("fs-extra");
const path = require("path");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const express = require("express");

// --- HTTP keep-alive ---
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (_req, res) => res.send("OK"));
app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.listen(PORT, () => console.log(`[web] listening on :${PORT}`));

// --- Bot クライアント ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.GuildMember]
});

// --- データ保存用 ---
const dataDir = path.join(__dirname, "data");
fs.ensureDirSync(dataDir);
client.settings = fs.readJsonSync(path.join(dataDir, "settings.json"), { throws: false }) || { logChannel: null, imageChannels: [], linkRestrictChannels: [] };
client.xp = fs.readJsonSync(path.join(dataDir, "xp.json"), { throws: false }) || {};
client.warnings = fs.readJsonSync(path.join(dataDir, "warnings.json"), { throws: false }) || {};
client.bannedWords = fs.readJsonSync(path.join(dataDir, "banned.json"), { throws: false }) || [];
client.quizzes = fs.readJsonSync(path.join(dataDir, "quiz.json"), { throws: false }) || [];
client.tickets = new Collection();

client.saveData = (file) => {
  switch (file) {
    case 'settings':
      fs.writeJsonSync(path.join(dataDir, "settings.json"), client.settings);
      break;
    case 'xp':
      fs.writeJsonSync(path.join(dataDir, "xp.json"), client.xp);
      break;
    case 'warnings':
      fs.writeJsonSync(path.join(dataDir, "warnings.json"), client.warnings);
      break;
    case 'bannedWords':
      fs.writeJsonSync(path.join(dataDir, "banned.json"), client.bannedWords);
      break;
    case 'quizzes':
      fs.writeJsonSync(path.join(dataDir, "quiz.json"), client.quizzes);
      break;
    default:
      console.log('Unknown file to save.');
  }
};

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(process.env.DISCORD_TOKEN);