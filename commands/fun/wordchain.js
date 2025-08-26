const { SlashCommandBuilder, EmbedBuilder, Events } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wordchain')
    .setDescription('BOTとしりとりをします。')
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('新しいしりとりゲームを開始します。'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('end')
        .setDescription('しりとりゲームを終了します。')),
  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'start') {
      if (client.wordchainGame && client.wordchainGame.isActive) {
        return interaction.reply({ content: '⚠️ 既にゲームが進行中です。', ephemeral: true });
      }

      client.wordchainGame = {
        isActive: true,
        channelId: interaction.channel.id,
        lastWord: 'りんご',
        usedWords: new Set(['りんご']),
        turn: interaction.user.id
      };
      
      const embed = new EmbedBuilder()
        .setColor(0xffa500)
        .setTitle('しりとりゲーム')
        .setDescription(`ゲームを開始します！\n最初の単語は **${client.wordchainGame.lastWord}** です。\n「ご」から始まる言葉を言ってね。`);
        
      await interaction.reply({ embeds: [embed] });

      // メッセージリスナー
      const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id && client.wordchainGame.isActive;
      const collector = interaction.channel.createMessageCollector({ filter, time: 600000 });

      collector.on('collect', m => {
        const lastChar = client.wordchainGame.lastWord.slice(-1);
        const newWord = m.content.toLowerCase();

        if (newWord.startsWith(lastChar)) {
          if (newWord.endsWith('ん')) {
            m.reply('🚫 「ん」で終わったのであなたの負けです！');
            collector.stop();
            client.wordchainGame.isActive = false;
            return;
          }
          if (client.wordchainGame.usedWords.has(newWord)) {
            m.reply('🚫 その言葉は既に使われています！あなたの負けです。');
            collector.stop();
            client.wordchainGame.isActive = false;
            return;
          }

          client.wordchainGame.lastWord = newWord;
          client.wordchainGame.usedWords.add(newWord);
          client.wordchainGame.turn = client.user.id;
          
          m.reply(`✅ 次は「${newWord.slice(-1)}」から始まる言葉をどうぞ。`);
          
          // Botのターン
          setTimeout(() => {
            const botWord = getBotWord(client.wordchainGame.lastWord, client.wordchainGame.usedWords);
            if (botWord) {
              client.wordchainGame.lastWord = botWord;
              client.wordchainGame.usedWords.add(botWord);
              m.channel.send(`🤖 ${botWord}`);
              if (botWord.endsWith('ん')) {
                m.channel.send('🎉 Botの負けです！あなたの勝利！');
                collector.stop();
                client.wordchainGame.isActive = false;
              } else {
                client.wordchainGame.turn = interaction.user.id;
                m.channel.send(`次は「${botWord.slice(-1)}」から始まる言葉をどうぞ。`);
              }
            } else {
              m.channel.send('🤔 Botはもう言葉が思いつきません...あなたの勝利です！');
              collector.stop();
              client.wordchainGame.isActive = false;
            }
          }, 2000);

        } else {
          m.reply(`⚠️ 「${lastChar}」から始まる言葉を言ってください。`);
        }
      });
      
      collector.on('end', () => {
        if (client.wordchainGame.isActive) {
          interaction.channel.send('ゲームが終了しました。');
          client.wordchainGame.isActive = false;
        }
      });

    } else if (subcommand === 'end') {
      if (!client.wordchainGame || !client.wordchainGame.isActive) {
        return interaction.reply({ content: '⚠️ 進行中のしりとりゲームはありません。', ephemeral: true });
      }

      client.wordchainGame.isActive = false;
      await interaction.reply('しりとりゲームを強制終了しました。');
    }
  },
};

// Botが単語を生成する関数 (シンプルな例)
function getBotWord(lastWord, usedWords) {
  const botWords = ['ごりら', 'らっぱ', 'ぱんだ', 'だちょう', 'うさぎ', 'ぎたー'];
  const lastChar = lastWord.slice(-1);
  const availableWords = botWords.filter(word => word.startsWith(lastChar) && !usedWords.has(word));
  return availableWords[0] || null;
}