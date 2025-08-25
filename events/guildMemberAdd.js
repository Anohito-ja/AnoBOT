const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member, client) {
    const logChannelId = client.settings.logChannel;
    if (logChannelId) {
      const logChannel = member.guild.channels.cache.get(logChannelId);
      if (logChannel) {
        const welcomeEmbed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setDescription(`✅ ${member.user.tag} がサーバーに参加しました！`);
        logChannel.send({ embeds: [welcomeEmbed] });
      }
    }
  },
};