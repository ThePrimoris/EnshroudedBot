const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { UserNote } = require('../../database'); // Ensure this path correctly points to where your UserNote model is defined

module.exports = {
    data: {
        name: 'note',
        description: 'Records a note for a user.',
        options: [
            {
                name: 'user',
                type: 'USER',
                description: 'The user to record the note for.',
                required: true,
            },
            {
                name: 'note',
                type: 'STRING',
                description: 'The content of the note.',
                required: true,
            },
        ],
    },
    category: 'moderation',
    async execute(interaction) {
        // Permission check to ensure the user has the ability to manage messages
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const user = interaction.options.getUser('user'); // Getting the user for whom the note is about
        const noteContent = interaction.options.getString('note'); // The content of the note
        const createdBy = interaction.user.username; // Automatically capture the ID of the user issuing the command

        // Attempt to record the note in the database
        try {
            await UserNote.create({
                userId: user.id, // The ID of the user the note is about
                note: noteContent, // The actual note content
                createdBy: createdBy, // The ID of the user who created the note
                // `date` is automatically handled by Sequelize if you have `timestamps: true` or by default `createdAt`
            });

            // Reply to confirm the note has been recorded
            await interaction.reply({ content: `Note recorded for ${user.username}.`, ephemeral: false });
        } catch (error) {
            console.error('Failed to record note:', error);
            await interaction.reply({ content: 'Failed to record note. Please try again later.', ephemeral: true });
        }
    },
};
