const { SlashCommandBuilder, ChannelType, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('プライベートなチケットチャンネルを管理します。')
    .addSubcommand(subcommand =>
      subcommand
        .setName('open')
        .setDescription('新しいチケットを開きます。')
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('チケットを開く理由')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('close')
        .setDescription('現在のチケットを閉じます。')),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'open') {
      const reason = interaction.options.getString('reason') || '理由がありません。';
      const guild = interaction.guild;
      const user = interaction.user;

      const existingTicket = guild.channels.cache.find(c => c.name === `ticket-${user.username.toLowerCase()}`);
      if (existingTicket) {
        return interaction.reply({ content: '⚠️ 既に開いているチケットがあります。', ephemeral: true });
      }

      const ticketChannel = await guild.channels.create({
        name: `ticket-${user.username.toLowerCase()}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
          {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          // 管理者ロールやBotのロールに権限を与える場合はここに追加
        ],
      });

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('🎫 サポートチケット')
        .setDescription('チケットが開かれました。担当者からの返信をお待ちください。')
        .addFields(
          { name: '開いたユーザー', value: `<@${user.id}>` },
          { name: '理由', value: reason }
        )
        .setTimestamp();

      await ticketChannel.send({ embeds: [embed] });
      await interaction.reply({ content: `✅ チケットが開かれました。${ticketChannel}で確認してください。`, ephemeral: true });

    } else if (subcommand === 'close') {
      if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({ content: '⚠️ このチャンネルはチケットではありません。', ephemeral: true });
      }

      const ticketChannel = interaction.channel;
      await interaction.reply('チケットを閉じます...');
      await ticketChannel.delete();
    }
  },
};