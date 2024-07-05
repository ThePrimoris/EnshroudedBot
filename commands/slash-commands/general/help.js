const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays information about commands.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),
    category: 'general',
    async execute(interaction) {
        const memberPermissions = interaction.member.permissions;

        // Building the select menu options from commands, including a permissions check
        const commandOptions = Array.from(interaction.client.commands.values()).filter(cmd => {
            // If the command has a requiredPermissions array, check if the user has all those permissions
            if (cmd.requiredPermissions) {
                return cmd.requiredPermissions.every(perm => 
                    memberPermissions.has(PermissionsBitField.Flags[perm])
                );
            }
            // Include the command if it does not specify required permissions
            return true;
        }).map(cmd => ({
            label: cmd.data.name,
            description: cmd.data.description.slice(0, 50), // Limit description length
            value: cmd.data.name,
        }));

        // Ensuring there are commands available to display after filtering
        if (commandOptions.length === 0) {
            await interaction.reply({ content: "No commands available for you to use based on your permissions.", ephemeral: true });
            return;
        }

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
