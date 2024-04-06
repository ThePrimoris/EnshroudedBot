const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const commandsList = require('../../commands.json'); // Adjust the path as necessary

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all available commands.'),
    async execute(interaction) {
        const commandsEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Bot Commands')
            .setDescription('Here are all the available commands:');

        // Dynamically add fields for each command in your commands.json
        commandsList.forEach(cmd => {
            commandsEmbed.addFields({ name: `/${cmd.name}`, value: cmd.description });
        });

        await interaction.reply({ embeds: [commandsEmbed], ephemeral: true });
    },
};
