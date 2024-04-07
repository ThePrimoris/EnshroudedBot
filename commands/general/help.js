const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const commandsList = require('../../commands.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all available commands.')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('The category of commands to display')
                .setRequired(false)
                .addChoices(
                    { name: 'General', value: 'general' },
                    { name: 'Moderation', value: 'moderation' }
                ))
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('The page number of commands to display')
                .setRequired(false)),
    async execute(interaction) {
        const category = interaction.options.getString('category') || 'general';
        let page = interaction.options.getInteger('page') || 1;

        const filteredCommands = commandsList.filter(cmd => cmd.category === category);
        const totalPages = Math.ceil(filteredCommands.length / 10);
        
        page = Math.max(1, Math.min(page, totalPages));

        const startIndex = (page - 1) * 10;
        const endIndex = startIndex + 10;
        const commandsToShow = filteredCommands.slice(startIndex, endIndex);

        const commandsEmbed = {
            color: parseInt("0099ff", 16),
            title: `${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
            description: `Page ${page} of ${totalPages}`,
            fields: commandsToShow.map(cmd => ({ name: `/${cmd.name}`, value: cmd.description })),
        };

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous_page')
                    .setLabel('Previous')
                    .setStyle(1)
                    .setDisabled(page <= 1),
                new ButtonBuilder()
                    .setCustomId('next_page')
                    .setLabel('Next')
                    .setStyle(1)
                    .setDisabled(page >= totalPages)
            );

        await interaction.reply({ embeds: [commandsEmbed], components: [actionRow], ephemeral: true });
    },
};
