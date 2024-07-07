const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { UserWarning } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Records a warning for a user.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to record the warning for.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for the warning.')
                .setRequired(true)),
    requiredPermissions: ['ManageMessages'],
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const issuerId = interaction.user.id; // Get the issuer's ID
        const issuerName = interaction.user.username; // Get the issuer's username

        try {
            // Create a new infraction record in the database
            await UserWarning.create({
                userId: user.id,
                reason: reason,
                issuerId: issuerId,
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

            await interaction.reply({ content: `Warning recorded for ${user.username} for reason: ${reason}`, ephemeral: false }); // If you want the reply to be public, set ephemeral to false
        } catch (error) {
            console.error('Failed to record warning:', error);
            await interaction.reply({ content: 'Failed to record warning. Please try again later.', ephemeral: true });
        }
    },
};
