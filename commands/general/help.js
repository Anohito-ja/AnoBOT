const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('利用可能なコマンドを一覧表示します。'),
  async execute(interaction) {
    const commandsPath = path.join(__dirname, '..');
    const commandFolders = fs.readdirSync(commandsPath);

    const helpEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Botのコマンドリスト')
      .setDescription('利用可能なすべてのスラッシュコマンドです。');

    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
      const commandList = [];

      for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
          commandList.push(`\`/${command.data.name}\`: ${command.data.description}`);
        }
      }

      if (commandList.length > 0) {
        helpEmbed.addFields({
          name: `__${folder.charAt(0).toUpperCase() + folder.slice(1)}__`,
          value: commandList.join('\n')
        });
      }
    }

    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  },
};
