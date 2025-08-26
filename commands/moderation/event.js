const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs-extra');
const path = require('path');

// イベントデータを保存するファイルパスを定義
const eventsFile = path.join(__dirname, '../../data/events.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('event')
    .setDescription('イベントを管理します。')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('新しいイベントを作成します。')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('イベント名')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('date')
            .setDescription('開催日時 (例: YYYY-MM-DD HH:mm)')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('イベントの詳細')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('開催予定のイベント一覧を表示します。'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('join')
        .setDescription('イベントに参加登録します。')
        .addStringOption(option =>
          option.setName('event_id')
            .setDescription('参加するイベントのID')
            .setRequired(true))),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const events = fs.readJsonSync(eventsFile, { throws: false }) || [];

    if (subcommand === 'create') {
      const name = interaction.options.getString('name');
      const date = interaction.options.getString('date');
      const description = interaction.options.getString('description') || '詳細はありません。';
      const eventId = Date.now().toString();

      const newEvent = {
        id: eventId,
        name,
        date,
        description,
        creator: interaction.user.id,
        participants: [],
      };
      events.push(newEvent);
      fs.writeJsonSync(eventsFile, events);

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('🎉 新しいイベントが作成されました')
        .addFields(
          { name: 'イベント名', value: name },
          { name: '開催日時', value: date },
          { name: '詳細', value: description },
          { name: 'イベントID', value: `\`${eventId}\`` }
        );
      await interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'list') {
      if (events.length === 0) {
        return interaction.reply('🗓️ 開催予定のイベントはありません。');
      }

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('開催予定のイベント一覧');

      events.forEach(event => {
        embed.addFields({
          name: `**${event.name}**`,
          value: `日時: ${event.date}\n参加者: ${event.participants.length}人\nID: \`${event.id}\``,
        });
      });
      await interaction.reply({ embeds: [embed] });

    } else if (subcommand === 'join') {
      const eventId = interaction.options.getString('event_id');
      const event = events.find(e => e.id === eventId);

      if (!event) {
        return interaction.reply({ content: '⚠️ 指定されたイベントIDは存在しません。', ephemeral: true });
      }

      if (event.participants.includes(interaction.user.id)) {
        return interaction.reply({ content: '⚠️ あなたは既にこのイベントに参加登録しています。', ephemeral: true });
      }

      event.participants.push(interaction.user.id);
      fs.writeJsonSync(eventsFile, events);
      await interaction.reply({ content: `✅ **${event.name}** に参加登録しました！` });
    }
  },
};