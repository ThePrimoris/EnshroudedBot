const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { UserInfraction } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infraction')
        .setDescription('Records an infraction for a user.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to record the infraction for.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for the infraction.')
                .setRequired(true)),
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const issuerName = interaction.user.username;

        try {
            // Create a new infraction record in the database
            await UserInfraction.create({
                userId: user.id,
                reason: reason,
                issuerName: issuerName,
            });

            // Attempt to send a DM to the user
            try {
                await user.send(`You have received a warning in ${interaction.guild.name} for reason: ${reason}.`);
            } catch (dmError) {
                console.warn(`Failed to send a DM to ${user.username}: ${dmError}`);
                // Optionally, inform the command issuer that the DM could not be sent.
                await interaction.followUp({ content: `Note: Could not send a DM to ${user.username}. They might have DMs disabled.`, ephemeral: true });
            }

            await interaction.reply({ content: `Infraction recorded for ${user.username} for reason: ${reason}`, ephemeral: false }); // If you want the reply to be public, set ephemeral to false
        } catch (error) {
            console.error('Failed to record infraction:', error);
            await interaction.reply({ content: 'Failed to record infraction. Please try again later.', ephemeral: true });
        }
    },
};
