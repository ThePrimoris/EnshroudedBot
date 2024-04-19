const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { CustomCommand } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('custom')
        .setDescription('Create a custom command.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),
    async execute(interaction) {
        // Modal to collect command information
        const modal = new ModalBuilder()
            .setCustomId('createCustomCommand')
            .setTitle('Create Custom Command')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('commandName')
                        .setLabel('Command Name')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('Command name here')
                        .setRequired(true),
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('title')
                        .setLabel('Embed Title')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('Title here')
                        .setRequired(true),
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('description')
                        .setLabel('Embed Description')
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder('Description here')
                        .setRequired(true),
                ),
            );

        await interaction.showModal(modal);
    },

    async handleModalSubmit(modal) {
        if (modal.customId === 'createCustomCommand') {
            const name = modal.fields.getTextInputValue('commandName');
            const title = modal.fields.getTextInputValue('title');
            const description = modal.fields.getTextInputValue('description');

            try {
                // Attempt to save the new custom command to the database
                await CustomCommand.create({ name, title, description });
                await modal.reply({ content: `Custom command \`${name}\` has been created successfully!`, ephemeral: true });
            } catch (error) {
                console.error('Error saving custom command:', error);
                await modal.reply({ content: 'There was an error creating the custom command. It might already exist or there was a server error.', ephemeral: true });
            }
        }
    }
};
