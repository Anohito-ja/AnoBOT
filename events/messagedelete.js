const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.MessageDelete,
  async execute(message) {
    if (message.author.bot) return;

    const client = message.client;
    const logChannelId = client.settings.logChannel;

    if (!logChannelId) return;

    try {
      const logChannel = await client.channels.fetch(logChannelId);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor(0xeb4034)
        .setTitle('メッセージが削除されました')
        .setDescription(`**${message.author.tag}** のメッセージが削除されました。`)
        .addFields(
          { name: 'チャンネル', value: `<#${message.channel.id}>`, inline: true },
          { name: 'ユーザーID', value: message.author.id, inline: true },
          { name: 'メッセージ内容', value: message.content ? message.content.slice(0, 1024) : '内容がありません', inline: false }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error sending message delete log:', error);
    }
  },
};
