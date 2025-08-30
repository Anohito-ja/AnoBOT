const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('五目並べを開始します。'),
  async execute(interaction) {
    // ゲームの状態を管理する変数
    const board = Array(9).fill(null);
    const players = [interaction.user.id, null];
    let currentPlayerIndex = 0;
    
    // ゲームに参加するボタンを作成
    const joinButton = new ButtonBuilder()
      .setCustomId('tictactoe_join')
      .setLabel('対戦に参加')
      .setStyle(ButtonStyle.Primary);
      
    const initialRow = new ActionRowBuilder().addComponents(joinButton);
    
    const initialEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('五目並べ')
      .setDescription('対戦相手が「対戦に参加」ボタンを押すのを待っています...');
      
    const reply = await interaction.reply({
      embeds: [initialEmbed],
      components: [initialRow],
      fetchReply: true
    });

    const collectorFilter = i => i.customId === 'tictactoe_join' || (i.customId.startsWith('tictactoe_') && players.includes(i.user.id));
    const collector = reply.createMessageComponentCollector({ filter: collectorFilter, time: 300000 });

    const updateBoardButtons = () => {
      const newButtons = [];
      for (let j = 0; j < 9; j++) {
        const customId = `tictactoe_${j}`;
        const label = board[j] === '❌' ? '❌' : board[j] === '⭕' ? '⭕' : '\u200b';
        const style = board[j] === '❌' ? ButtonStyle.Danger : board[j] === '⭕' ? ButtonStyle.Success : ButtonStyle.Secondary;
        newButtons.push(new ButtonBuilder()
          .setCustomId(customId)
          .setLabel(label)
          .setStyle(style)
          .setDisabled(board[j] !== null));
      }
      return [
        new ActionRowBuilder().addComponents(newButtons.slice(0, 3)),
        new ActionRowBuilder().addComponents(newButtons.slice(3, 6)),
        new ActionRowBuilder().addComponents(newButtons.slice(6, 9))
      ];
    };

    const checkWin = () => {
      const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];
      for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return board[a];
        }
      }
      return null;
    };
    
    const isBoardFull = () => !board.includes(null);

    collector.on('collect', async i => {
      if (i.customId === 'tictactoe_join') {
        if (players.includes(i.user.id)) {
          await i.reply({ content: 'あなたは既にゲームに参加しています。', ephemeral: true });
          return;
        }
        players[1] = i.user.id;
        
        const gameStartEmbed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle('五目並べ')
          .setDescription(`プレイヤー1 (❌): <@${players[0]}>\nプレイヤー2 (⭕): <@${players[1]}>\n\n**<@${players[0]}>**の番です。`);
          
        await i.update({
          embeds: [gameStartEmbed],
          components: updateBoardButtons()
        });
        
        return;
      }
      
      // ゲーム開始後のボタンクリック処理
      if (!players.includes(i.user.id)) {
        await i.reply({ content: 'このゲームに参加していません。', ephemeral: true });
        return;
      }
      
      if (players[currentPlayerIndex] !== i.user.id) {
        await i.reply({ content: 'あなたの番ではありません。', ephemeral: true });
        return;
      }
      
      const position = parseInt(i.customId.split('_')[1]);
      const marker = currentPlayerIndex === 0 ? '❌' : '⭕';
      
      if (board[position] === null) {
        board[position] = marker;
        
        const winner = checkWin();
        if (winner) {
          const finalEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('ゲーム終了')
            .setDescription(`🎉 **<@${i.user.id}>**の勝利です！`)
            .setTimestamp();
          
          await i.update({ embeds: [finalEmbed], components: [] });
          collector.stop();
          return;
        }
        
        if (isBoardFull()) {
          const finalEmbed = new EmbedBuilder()
            .setColor(0x808080)
            .setTitle('ゲーム終了')
            .setDescription('引き分けです！');
          
          await i.update({ embeds: [finalEmbed], components: [] });
          collector.stop();
          return;
        }
        
        currentPlayerIndex = (currentPlayerIndex + 1) % 2;
        const nextPlayer = players[currentPlayerIndex];
        
        const nextEmbed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle('五目並べ')
          .setDescription(`プレイヤー1 (❌): <@${players[0]}>\nプレイヤー2 (⭕): <@${players[1]}>\n\n**<@${nextPlayer}>**の番です。`);
        
        await i.update({ embeds: [nextEmbed], components: updateBoardButtons() });
      } else {
        await i.reply({ content: 'そのマスはすでに埋まっています。', ephemeral: true });
      }
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time' && players[1] === null) {
        const timeoutEmbed = new EmbedBuilder()
          .setColor(0x808080)
          .setTitle('ゲーム終了')
          .setDescription('対戦相手が見つからなかったため、ゲームを終了します。');
        await reply.edit({ embeds: [timeoutEmbed], components: [] });
      } else if (reason === 'time' && players[1] !== null && !checkWin() && !isBoardFull()) {
        const timeoutEmbed = new EmbedBuilder()
          .setColor(0x808080)
          .setTitle('ゲーム終了')
          .setDescription('制限時間切れにより、ゲームを終了します。');
        await reply.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  },
};
