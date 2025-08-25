const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('指定したユーザーと三目並べをプレイします。')
    .addUserOption(option =>
      option.setName('opponent')
        .setDescription('対戦相手')
        .setRequired(true)),
  async execute(interaction) {
    const opponent = interaction.options.getUser('opponent');
    
    if (opponent.bot) {
      return interaction.reply({ content: 'Botとは対戦できません。', ephemeral: true });
    }
    
    const board = [
      ['-','-','-'],
      ['-','-','-'],
      ['-','-','-']
    ];
    
    const player1 = interaction.user;
    const player2 = opponent;
    let currentPlayer = player1;

    const createButtonRow = () => {
      const row = new ActionRowBuilder();
      for (let i = 0; i < 9; i++) {
        const x = Math.floor(i / 3);
        const y = i % 3;
        const button = new ButtonBuilder()
          .setCustomId(`tictactoe_${x}_${y}`)
          .setLabel(board[x][y] === '-' ? ' ' : board[x][y])
          .setStyle(board[x][y] === 'X' ? ButtonStyle.Primary : (board[x][y] === 'O' ? ButtonStyle.Danger : ButtonStyle.Secondary))
          .setDisabled(board[x][y] !== '-');
        row.addComponents(button);
      }
      return [row];
    };
    
    const initialMessage = await interaction.reply({
      content: `ゲーム開始！\n${player1} (X) vs ${player2} (O)\n${currentPlayer}のターンです。`,
      components: createButtonRow(),
      fetchReply: true
    });
    
    const filter = i => i.customId.startsWith('tictactoe_') && (i.user.id === player1.id || i.user.id === player2.id);
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
    
    collector.on('collect', async i => {
      if (i.user.id !== currentPlayer.id) {
        return i.reply({ content: '今はあなたのターンではありません！', ephemeral: true });
      }
      
      const [_, x, y] = i.customId.split('_');
      board[x][y] = currentPlayer === player1 ? 'X' : 'O';
      
      const checkWinner = (player) => {
        const symbol = player === player1 ? 'X' : 'O';
        for (let i = 0; i < 3; i++) {
          if (board[i].every(cell => cell === symbol)) return true;
          if (board.every(row => row[i] === symbol)) return true;
        }
        if (board[0][0] === symbol && board[1][1] === symbol && board[2][2] === symbol) return true;
        if (board[0][2] === symbol && board[1][1] === symbol && board[2][0] === symbol) return true;
        return false;
      };
      
      const isDraw = board.flat().every(cell => cell !== '-');
      
      if (checkWinner(currentPlayer)) {
        await i.update({
          content: `🎉 **${currentPlayer.tag}** の勝利です！`,
          components: []
        });
        collector.stop();
      } else if (isDraw) {
        await i.update({
          content: `🤝 引き分けです！`,
          components: []
        });
        collector.stop();
      } else {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
        await i.update({
          content: `${currentPlayer}のターンです。`,
          components: createButtonRow()
        });
      }
    });
    
    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({ content: '時間切れです。ゲームは終了しました。', components: [] });
      }
    });
  },
};