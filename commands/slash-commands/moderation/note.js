const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { UserNote } = require('../../../database'); // Ensure the path points to your updated UserNote model

module.exports = {
    data: new SlashCommandBuilder()
        .setName('note')
        .setDescription('Records a note for a user.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to record the note for.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('note')
                .setDescription('The content of the note.')
                .setRequired(true)),
    requiredPermissions: ['ManageMessages'],
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const noteContent = interaction.options.getString('note');
        const issuerId = interaction.user.id;
        const issuerName = interaction.user.username;

        try {
            await UserNote.create({
                userId: user.id,
                note: noteContent,
                issuerId: issuerId,
                issuerName: issuerName,
            });

            await interaction.reply({ content: `Note recorded for ${user.username}: "${noteContent}".`, ephemeral: false });
        } catch (error) {
            console.error('Failed to record note:', error);
            await interaction.reply({ content: 'Failed to record note. Please try again later.', ephemeral: true });
        }
    },
};
