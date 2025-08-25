const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banlist')
    .setDescription('サーバーのBANリストを表示します。'),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: 'BANリストを表示する権限がありません。', ephemeral: true });
    }

    const bans = await interaction.guild.bans.fetch();
    if (bans.size === 0) {
      return interaction.reply('このサーバーにはBANされているユーザーはいません。');
    }

    const banList = bans.map(banInfo => {
      return `・${banInfo.user.tag} (ID: ${banInfo.user.id}) - 理由: ${banInfo.reason || 'なし'}`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('⛔ BANリスト')
      .setDescription(banList)
      .setColor(0xFF0000);

    await interaction.reply({ embeds: [embed] });
  },
};