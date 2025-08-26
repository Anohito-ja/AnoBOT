const { Events, PermissionsBitField } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(msg, client) {
    if (msg.author.bot) return;
// events/messageCreate.js の冒頭に追加

// メッセージトラッキング
const spamMap = new Map();
const WARN_THRESHOLD = 5; // 警告を与えるまでのメッセージ数
const INTERVAL = 10000;   // 警告を与えるまでの時間 (ミリ秒)

// ...既存のコード...

module.exports = {
  name: Events.MessageCreate,
  async execute(msg, client) {
    if (msg.author.bot) return;

    // --- スパム対策 ---
    if (!spamMap.has(msg.author.id)) {
      spamMap.set(msg.author.id, { count: 1, lastMessage: Date.now() });
    } else {
      const data = spamMap.get(msg.author.id);
      const currentTime = Date.now();
      
      if (currentTime - data.lastMessage < INTERVAL) {
        data.count++;
        if (data.count >= WARN_THRESHOLD) {
          msg.delete().catch(() => {});
          const warningCount = (client.warnings[msg.author.id] || 0) + 1;
          client.warnings[msg.author.id] = warningCount;
          client.saveData('warnings');
          msg.channel.send(`${msg.author}, ⚠️ 連続投稿を検知しました。警告 ${warningCount}回目です。`);
          data.count = 0; // カウントをリセット
        }
      } else {
        data.count = 1;
      }
      data.lastMessage = currentTime;
    }
    
    // ...既存のXP処理や禁止ワード監視のコード...
  },
};

    // XP処理
    client.xp[msg.author.id] = (client.xp[msg.author.id] || 0) + 1;
    client.saveData('xp');

    // 禁止ワード監視
    const isBanned = client.bannedWords.some(w => msg.content.toLowerCase().includes(w));
    if (isBanned) {
      msg.delete().catch(() => {});
      client.warnings[msg.author.id] = (client.warnings[msg.author.id] || 0) + 1;
      client.saveData('warnings');
      const warningCount = client.warnings[msg.author.id];
      msg.channel.send(`${msg.author}, 🚫 禁止ワードです！（警告 ${warningCount}回目）`);

      if (warningCount >= 3) {
        if (msg.member.bannable) {
          msg.member.ban({ reason: "禁止ワード累積" }).catch(() => {});
          msg.channel.send(`⛔ ${msg.author.tag} をBANしました。`);
        }
      }
    }

    // リンク禁止チャンネル
    if (client.settings.linkRestrictChannels.includes(msg.channel.id)) {
      const containsLink = /(https?:\/\/[^\s]+)/g.test(msg.content);
      if (containsLink) {
        if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          msg.delete().catch(() => {});
          msg.channel.send(`${msg.author}, このチャンネルではリンクの送信は許可されていません。`).then(m => setTimeout(() => m.delete(), 5000));
// events/messageCreate.jsの既存のコードの下に追加

// しりとりゲーム処理
if (client.wordchainGame && client.wordchainGame.isActive && msg.channel.id === client.wordchainGame.channelId) {
    const lastChar = client.wordchainGame.lastWord.slice(-1);
    const firstChar = msg.content.slice(0, 1);
    const isKana = (char) => /[ぁ-んァ-ン]/.test(char);

    if (msg.content.includes('ん')) {
        client.wordchainGame.isActive = false;
        msg.reply(`「ん」で終わりました。あなたの負けです！\nゲームを終了します。`);
        return;
    }

    if (isKana(lastChar) && firstChar !== lastChar) {
        return msg.reply(`⚠️ 前の言葉「**${client.wordchainGame.lastWord}**」の最後の文字は「**${lastChar}**」です。`)
            .then(m => setTimeout(() => m.delete(), 5000));
    }

    client.wordchainGame.lastWord = msg.content;
    msg.react('✅').catch(() => {});
}
        }
      }
    }

    // 画像専用チャンネル
    if (client.settings.imageChannels.includes(msg.channel.id)) {
      if (msg.attachments.size === 0) {
        msg.delete().catch(() => {});
        msg.channel.send(`${msg.author}, このチャンネルは画像専用です。`).then(m => setTimeout(() => m.delete(), 5000));
      }
    }
  },
};