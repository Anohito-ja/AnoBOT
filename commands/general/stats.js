const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('サーバーの統計情報を表示します。'),
  async execute(interaction) {
    const guild = interaction.guild;
    const memberCount = guild.memberCount;
    const botCount = guild.members.cache.filter(member => member.user.bot).size;
    const humanCount = memberCount - botCount;

    const memberList = guild.members.cache.map(m => m.user.tag).join(', ');

    const embed = new EmbedBuilder()
      .setTitle(`📊 サーバー統計: ${guild.name}`)
      .addFields(
        { name: 'メンバー総数', value: `${memberCount}`, inline: true },
        { name: 'ユーザー数', value: `${humanCount}`, inline: true },
        { name: 'Bot数', value: `${botCount}`, inline: true },
      )
      .setColor(0x7289da);

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};