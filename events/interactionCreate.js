const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Error executing command: ${error}`);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }).catch(console.error);
            }
        } else if (interaction.isButton()) {
            const [prefix, action, category, currentPage] = interaction.customId.split('_');

            if (prefix !== 'help') return;

            let page = parseInt(currentPage, 10);
            page = action === 'next' ? page + 1 : page - 1;

            // Assuming commands are categorized in your client.commands Collection
            const commandsList = Array.from(client.commands.values());
            const filteredCommands = commandsList.filter(cmd => cmd.data.category === category);
            const totalPages = Math.ceil(filteredCommands.length / 10);
            const startIndex = (page - 1) * 10;
            const endIndex = startIndex + 10;
            const commandsToShow = filteredCommands.slice(startIndex, endIndex);

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${category.charAt(0).toUpperCase() + category.slice(1)} Commands`)
                .setDescription(`Page ${page} of ${totalPages}`)
                .addFields(commandsToShow.map(cmd => ({ name: `/${cmd.data.name}`, value: cmd.data.description })));

            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`help_previous_${category}_${page}`)
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page <= 1),
                    new ButtonBuilder()
                        .setCustomId(`help_next_${category}_${page}`)
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page >= totalPages)
                );

            await interaction.update({ embeds: [embed], components: [buttons] }).catch(console.error);
        }
    },
};
