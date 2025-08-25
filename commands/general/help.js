const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('利用可能なコマンドを一覧表示します。'),
  async execute(interaction) {
    const commandsPath = path.join(path.resolve(), 'commands');
    const commandFolders = fs.readdirSync(commandsPath);

    const helpEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('📚 コマンドヘルプ')
      .setDescription('利用可能なコマンドとそれぞれの説明です。');

    for (const folder of commandFolders) {
      const commandsInFolder = fs.readdirSync(path.join(commandsPath, folder)).filter(file => file.endsWith('.js'));
      const commandList = commandsInFolder.map(file => {
        const command = require(path.join(commandsPath, folder, file));
        if (command.data) {
          return `\`/${command.data.name}\`: ${command.data.description}`;
        }
        return null;
      }).filter(Boolean);

      if (commandList.length > 0) {
        helpEmbed.addFields({
          name: `**${folder.charAt(0).toUpperCase() + folder.slice(1)}**`,
          value: commandList.join('\n')
        });
      }
    }

    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  },
};