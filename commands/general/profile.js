const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('指定したユーザーのプロフィールカードを表示します。')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('プロフィールを表示するユーザー')
        .setRequired(false)),
  async execute(interaction, client) {
    const user = interaction.options.getUser('target') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);
    
    if (!member) {
      return interaction.reply({ content: 'このサーバーにユーザーが見つかりません。', ephemeral: true });
    }

    const xp = client.xp[user.id] || 0;
    const warnings = client.warnings[user.id] || 0;
    const roles = member.roles.cache
      .filter(role => role.id !== interaction.guild.id)
      .map(role => role.toString())
      .join(' ') || 'なし';

    const profileEmbed = new EmbedBuilder()
      .setColor(member.displayHexColor || 0x0099ff)
      .setTitle(`${user.tag} のプロフィール`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'ユーザーID', value: `\`${user.id}\``, inline: true },
        { name: '発言XP', value: `${xp}`, inline: true },
        { name: '警告数', value: `${warnings}`, inline: true },
        { name: 'サーバー参加日', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: false },
        { name: '役割', value: roles, inline: false },
      )
      .setTimestamp();
      
    await interaction.reply({ embeds: [profileEmbed] });
  },
};