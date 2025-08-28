const { Events } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    const client = message.client;

    // 禁止ワードのチェック
    const isBannedWord = Array.isArray(client.bannedWords) && client.bannedWords.some(word => message.content.toLowerCase().includes(word.toLowerCase()));
    if (isBannedWord) {
      await message.delete();
      const replyMessage = await message.channel.send({ content: `${message.author} さん、禁止ワードが含まれています。` });
      setTimeout(() => replyMessage.delete(), 5000);
      return;
    }

    // 画像専用チャンネルのチェック
    if (Array.isArray(client.settings.imageChannels) && client.settings.imageChannels.includes(message.channel.id)) {
      if (message.attachments.size === 0) {
        await message.delete();
        return;
      }
    }

    // リンク禁止チャンネルのチェック
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (Array.isArray(client.settings.linkRestrictChannels) && client.settings.linkRestrictChannels.includes(message.channel.id)) {
      if (urlRegex.test(message.content)) {
        await message.delete();
        return;
      }
    }
  },
};
