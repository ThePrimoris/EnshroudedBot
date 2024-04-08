const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays information about commands.'),
    category: 'general',
    async execute(interaction) {
        // Building the select menu options from commands
        const commandOptions = Array.from(interaction.client.commands.values()).map(cmd => ({
            label: cmd.data.name,
            description: cmd.data.description.slice(0, 50), // Limit description length
            value: cmd.data.name,
        }));

        // Creating the select menu
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('selectCommand')
                    .setPlaceholder('Select a command')
                    .addOptions(commandOptions)
            );

        await interaction.reply({ content: "Select a command to get more information:", components: [row], ephemeral: true });
    },
};
