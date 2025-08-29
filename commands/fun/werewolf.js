const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('werewolf')
    .setDescription('人狼ゲームを開始します。'),
  async execute(interaction) {
    // ゲームの状態を管理するオブジェクト
    const gameState = {
      isGameRunning: false,
      players: new Map(),
      roles: ['人狼', '村人'], // 役割を追加可能
      currentPhase: '準備中', // 準備中, 夜, 昼
      dayCount: 0,
      host: interaction.user,
      mainChannel: interaction.channel,
      voteCollector: null,
      nightCollector: null,
    };

    if (gameState.isGameRunning) {
      return interaction.reply({ content: '現在、ゲームが進行中です。', ephemeral: true });
    }
    
    // ゲームの準備
    gameState.isGameRunning = true;
    gameState.players.set(interaction.user.id, { id: interaction.user.id, role: null });

    const joinEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('🐺 人狼ゲーム参加者募集！')
      .setDescription(`主催者: ${interaction.user}\n\n「参加する」ボタンを押して、ゲームに参加してください！`)
      .setFooter({ text: '最小3人からゲーム開始できます。' });

    const joinButton = new ButtonBuilder()
      .setCustomId('werewolf_join')
      .setLabel('参加する')
      .setStyle(ButtonStyle.Primary);
    
    const startButton = new ButtonBuilder()
      .setCustomId('werewolf_start')
      .setLabel('ゲーム開始')
      .setStyle(ButtonStyle.Success)
      .setDisabled(true);

    const row = new ActionRowBuilder().addComponents(joinButton, startButton);
    
    const reply = await interaction.reply({
      embeds: [joinEmbed],
      components: [row],
      fetchReply: true
    });

    const collector = reply.createMessageComponentCollector({ time: 600000 }); // 10分間募集

    collector.on('collect', async i => {
      if (i.customId === 'werewolf_join') {
        if (!gameState.players.has(i.user.id)) {
          gameState.players.set(i.user.id, { id: i.user.id, role: null });
          await i.reply({ content: `<@${i.user.id}>さんがゲームに参加しました！`, ephemeral: true });
          
          if (gameState.players.size >= 3) {
            startButton.setDisabled(false);
            const updatedRow = new ActionRowBuilder().addComponents(joinButton, startButton);
            await i.editReply({ components: [updatedRow] });
          }
        } else {
          await i.reply({ content: 'あなたは既にゲームに参加しています。', ephemeral: true });
        }
      } else if (i.customId === 'werewolf_start' && i.user.id === gameState.host.id) {
        if (gameState.players.size < 3) {
          await i.reply({ content: 'ゲームを開始するには最低3人のプレイヤーが必要です。', ephemeral: true });
          return;
        }
        
        await i.update({ embeds: [new EmbedBuilder().setTitle('人狼ゲーム').setDescription('ゲームを開始します！')], components: [] });
        collector.stop('started');
      } else {
        await i.reply({ content: 'ゲーム開始は主催者のみが行えます。', ephemeral: true });
      }
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'started') {
        // 役割を割り当て、ゲームを開始
        const playerArray = Array.from(gameState.players.values());
        const shuffledRoles = gameState.roles.slice().sort(() => 0.5 - Math.random());
        
        playerArray.forEach((player, index) => {
          player.role = shuffledRoles[index % shuffledRoles.length];
          // DMで役割を通知
          interaction.client.users.fetch(player.id).then(user => {
            user.send(`あなたの役割は「**${player.role}**」です。`);
          });
        });
        
        // 最初の夜のフェーズへ
        startNightPhase(interaction, gameState);
        
      } else {
        // 募集時間切れ
        gameState.isGameRunning = false;
        await interaction.followUp({ content: 'ゲーム参加者が集まらなかったため、ゲームは中止されました。' });
      }
    });
  },
};

/**
 * 夜のフェーズを開始する関数
 * @param {object} interaction - Discordインタラクションオブジェクト
 * @param {object} gameState - ゲームの状態オブジェクト
 */
async function startNightPhase(interaction, gameState) {
  gameState.currentPhase = '夜';
  gameState.dayCount++;

  const nightEmbed = new EmbedBuilder()
    .setColor(0x36393f)
    .setTitle(`🌙 夜が来ました (1日目)`)
    .setDescription('目を閉じ、人狼は行動を開始してください。');

  await interaction.followUp({ embeds: [nightEmbed] });

  // 夜のアクションを収集するためのロジックをここに実装
  // 例: 人狼にDMで村人を襲撃するよう促す
  // 例: 占い師にDMで占う相手を選ぶよう促す

  // 夜の行動が完了した後に、昼のフェーズに移行
  // startDayPhase(interaction, gameState);
}

/**
 * 昼のフェーズを開始する関数
 * @param {object} interaction - Discordインタラクションオブジェクト
 * @param {object} gameState - ゲームの状態オブジェクト
 */
async function startDayPhase(interaction, gameState) {
  gameState.currentPhase = '昼';
  const dayEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`☀️ 昼が来ました (1日目)`)
    .setDescription('議論を行い、追放する人物を投票で決めてください。');

  await interaction.followUp({ embeds: [dayEmbed] });

  // 投票ロジックをここに実装
  // 投票結果を収集し、追放者を決定
  // 追放者が決まったら、ゲームが終了したか判定
  // checkWinCondition(gameState);
}

/**
 * 勝利条件をチェックする関数
 * @param {object} gameState - ゲームの状態オブジェクト
 */
function checkWinCondition(gameState) {
  // 人狼の数と村人の数をカウント
  const werewolfCount = Array.from(gameState.players.values()).filter(p => p.role === '人狼').length;
  const villagerCount = Array.from(gameState.players.values()).filter(p => p.role === '村人').length; // 他の村人側の役職も含む

  if (werewolfCount >= villagerCount) {
    // 人狼が勝利
    // ゲーム終了のメッセージを送信
    // gameState.isGameRunning = false;
  } else if (werewolfCount === 0) {
    // 村人が勝利
    // ゲーム終了のメッセージを送信
    // gameState.isGameRunning = false;
  } else {
    // ゲーム続行
    // startNightPhase(interaction, gameState); or startDayPhase(interaction, gameState);
  }
}
