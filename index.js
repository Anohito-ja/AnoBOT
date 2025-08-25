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