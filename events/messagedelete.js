const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.MessageDelete,
  async execute(message, client) {
    if (message.author.bot || !client.settings.logChannel) return;

    const logChannel = message.guild.channels.cache.get(client.settings.logChannel);
    if (!logChannel) return;

    const deleteEmbed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle('🗑️ メッセージ削除')
      .setDescription(`**チャンネル**: ${message.channel}\n**ユーザー**: ${message.author.tag}`)
      .addFields(
        { name: '内容', value: message.content || '添付ファイル' }
      )
      .setTimestamp();
      
    logChannel.send({ embeds: [deleteEmbed] });
  },
};