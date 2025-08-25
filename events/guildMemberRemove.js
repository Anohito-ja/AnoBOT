const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member, client) {
    const logChannelId = client.settings.logChannel;
    if (logChannelId) {
      const logChannel = member.guild.channels.cache.get(logChannelId);
      if (logChannel) {
        const leaveEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setDescription(`🚪 ${member.user.tag} がサーバーを去りました。`);
        logChannel.send({ embeds: [leaveEmbed] });
      }
    }
  },
};