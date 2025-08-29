const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('ユーザーのプロフィール情報を表示します。')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('プロフィールを表示するユーザー')
        .setRequired(false)),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(targetUser.id);

    if (!member) {
      return interaction.reply({ content: 'このサーバーでユーザーが見つかりませんでした。', ephemeral: true });
    }

    const roles = member.roles.cache
      .filter(role => role.name !== '@everyone')
      .map(role => `<@&${role.id}>`)
      .join(', ');

    const profileEmbed = new EmbedBuilder()
      .setColor(member.displayHexColor || 0x0099ff)
      .setTitle(`${targetUser.username}のプロフィール`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'ユーザー', value: `<@${targetUser.id}>`, inline: true },
        { name: 'ユーザーID', value: targetUser.id, inline: true },
        { name: 'Discord参加日', value: `<t:${Math.floor(targetUser.createdAt.getTime() / 1000)}:f>`, inline: true },
        { name: 'サーバー参加日', value: `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:f>`, inline: true },
        { name: 'ロール', value: roles.length > 0 ? roles : 'なし' },
      )
      .setFooter({ text: `最終更新: ${new Date().toLocaleDateString('ja-JP')}` });

    await interaction.reply({ embeds: [profileEmbed] });
  },
};
