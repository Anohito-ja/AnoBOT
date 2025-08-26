const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('指定したユーザーの情報を表示します。')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('情報を表示するユーザー')
        .setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('target') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: 'このサーバーにユーザーが見つかりません。', ephemeral: true });
    }

    const roles = member.roles.cache.map(role => role.toString()).join(' ');

    const userInfoEmbed = new EmbedBuilder()
      .setColor(member.displayHexColor)
      .setTitle(`${user.tag} の情報`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'ユーザーID', value: user.id, inline: true },
        { name: 'サーバー参加日', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>`, inline: true },
        { name: 'アカウント作成日', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:f>`, inline: true },
        { name: '役割', value: roles.length > 0 ? roles : 'なし' },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [userInfoEmbed] });
  },
<<<<<<< HEAD
};
=======
};
>>>>>>> 847512c7e09a4c27175b8ed36990db4821422739
