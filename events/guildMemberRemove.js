const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    const client = member.client;
    const logChannelId = client.settings.logChannel;

    if (!logChannelId) return;

    try {
      const logChannel = await client.channels.fetch(logChannelId);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('メンバーが退出しました')
        .setDescription(`**${member.user.tag}** がサーバーから退出しました。`)
        .addFields(
          { name: 'ユーザーID', value: member.user.id, inline: true },
          { name: '参加日', value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>` : '不明', inline: true }
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error sending guild member remove log:', error);
    }
  },
};
