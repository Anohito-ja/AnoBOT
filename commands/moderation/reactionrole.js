const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('リアクションでロールを付与するメッセージを作成します。')
    .addStringOption(option =>
      option.setName('role_id')
        .setDescription('付与するロールのID')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('トリガーとなる絵文字')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('リアクションロールメッセージの説明文')
        .setRequired(false)),
  async execute(interaction) {
    const roleId = interaction.options.getString('role_id');
    const emoji = interaction.options.getString('emoji');
    const description = interaction.options.getString('description') || 'リアクションをしてロールをゲットしよう！';

    const guild = interaction.guild;
    const role = guild.roles.cache.get(roleId);
    if (!role) {
      return interaction.reply({ content: '⚠️ 指定されたロールIDは無効です。', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('リアクションロール')
      .setDescription(description)
      .addFields({ name: 'ロール', value: `<@&${role.id}>` })
      .setColor(role.color || 0x0099ff);

    const message = await interaction.channel.send({ embeds: [embed] });
    await message.react(emoji);

    // リアクションロール情報をデータに保存
    const reactionRoleData = {
      messageId: message.id,
      roleId: role.id,
      emoji: emoji,
    };

    // `client.data.reactionRoles`に保存するロジックを`index.js`に追加する必要があります
    // ここでは仮にファイルに保存するとしています
    // ここにリアクションロールのデータを保存するロジックを記述します
    // (例: `client.data.reactionRoles.push(reactionRoleData); client.saveData('reactionRoles');`)
    
    await interaction.reply({ content: '✅ リアクションロールメッセージが作成されました。', ephemeral: true });
  },
};