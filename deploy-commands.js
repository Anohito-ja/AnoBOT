const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

// 環境変数からBotトークンとクライアントIDを取得
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // 開発中に特定のギルドにコマンドを登録する場合

const commands = [];
// commandsフォルダ内のすべてのサブフォルダを読み込む
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(`[WARNING] ${filePath} のコマンドには、必要な "data" または "execute" プロパティがありません。`);
    }
  }
}

// RESTモジュールのインスタンスを準備
const rest = new REST().setToken(token);

// コマンドを登録・デプロイ
(async () => {
  try {
    console.log(`${commands.length} 個のアプリケーション (/) コマンドの更新を開始します。`);

    // グローバルまたはギルドコマンドのデプロイ
    let data;
    if (guildId) {
      // 特定のギルドにコマンドを登録（開発用）
      data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
      console.log(`${data.length} 個のギルド (/) コマンドを正常に再読み込みしました。`);
    } else {
      // 全てのギルドにコマンドを登録（本番用）
      data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands },
      );
      console.log(`${data.length} 個のグローバル (/) コマンドを正常に再読み込みしました。`);
    }
  } catch (error) {
    console.error(error);
  }
})();
