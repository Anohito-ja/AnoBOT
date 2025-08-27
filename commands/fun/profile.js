const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('あなたのプロフィールカードを表示します。')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('プロフィールを表示するユーザー')
        .setRequired(false)),
  async execute(interaction, client) {
    const targetUser = interaction.options.getUser('user') || interaction.user;

    const userXp = client.data.xp[targetUser.id] || 0;
    const userWarnings = client.data.warnings[targetUser.id] || 0;

    const profileEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`${targetUser.username} のプロフィール`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'XP (発言数)', value: `${userXp}`, inline: true },
        { name: '警告回数', value: `${userWarnings}`, inline: true },
        { name: '参加日', value: `<t:${Math.floor(targetUser.joinedTimestamp / 1000)}:R>`, inline: true }
      )
      .setFooter({ text: `ID: ${targetUser.id}` })
      .setTimestamp();

    await interaction.reply({ embeds: [profileEmbed] });
  },

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('あなたのプロフィールカードを表示します。')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('プロフィールを表示するユーザー')
        .setRequired(false)),
  async execute(interaction, client) {
    const targetUser = interaction.options.getUser('user') || interaction.user;

    const userXp = client.data.xp[targetUser.id] || 0;
    const userWarnings = client.data.warnings[targetUser.id] || 0;

    const profileEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`${targetUser.username} のプロフィール`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'XP (発言数)', value: `${userXp}`, inline: true },
        { name: '警告回数', value: `${userWarnings}`, inline: true },
        { name: '参加日', value: `<t:${Math.floor(targetUser.joinedTimestamp / 1000)}:R>`, inline: true }
      )
      .setFooter({ text: `ID: ${targetUser.id}` })
      .setTimestamp();

    await interaction.reply({ embeds: [profileEmbed] });
  },
};