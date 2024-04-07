const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all available commands.'),
    category: 'general',
    async execute(interaction) {
        // Initialize a structure to hold commands by category
        const categories = {};

        // Organize commands by their categories
        interaction.client.commands.forEach(command => {
            const category = command.category || 'Uncategorized';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(command);
        });

        // Combine all categories and commands into a single array for pagination
        const allCommands = [];
        Object.keys(categories).forEach(category => {
            allCommands.push(`**${category.charAt(0).toUpperCase() + category.slice(1)} Commands**`);
            categories[category].forEach(cmd => {
                const commandUsage = cmd.data.options.map(option => `\`${option.name}\``).join(' '); // Mapping command options to usage format
                allCommands.push(`/${cmd.data.name} - ${cmd.data.description} - ${commandUsage}`);
            });
        });

        // Pagination setup
        let page = interaction.options.getInteger('page') || 1;
        const itemsPerPage = 10;
        const totalPages = Math.ceil(allCommands.length / itemsPerPage);
        page = Math.max(1, Math.min(page, totalPages)); // Ensure the page is within bounds

        // Calculate the slice of commands to display
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const commandsToShow = allCommands.slice(startIndex, endIndex);

        // Create the embed
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Commands List')
            .setDescription(commandsToShow.join('\n\n')) // Ensure there's space between commands for readability
            .setFooter({ text: `Page ${page} of ${totalPages}` });

        // Pagination buttons
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`help_previous_${page}`)
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page <= 1),
                new ButtonBuilder()
                    .setCustomId(`help_next_${page}`)
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page >= totalPages)
            );

        // Reply with the embed and buttons
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },
};
