<<<<<<< HEAD
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
=======
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
>>>>>>> 847512c7e09a4c27175b8ed36990db4821422739
};