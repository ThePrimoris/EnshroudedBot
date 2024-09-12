const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Removes the timeout from a user.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to untimeout.')
                .setRequired(true)),
    requiredPermissions: ['ModerateMembers'],
    category: 'moderation',
    async execute(interaction) {
        // Check for ModerateMembers permission before proceeding with the /unmute command
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const user = interaction.options.getUser('user');

        // Attempt to fetch the member from the guild
        let member;
        try {
            member = await interaction.guild.members.fetch(user.id);
        } catch (error) {
            console.error('Failed to fetch member:', error);
            return interaction.reply({ content: 'Failed to fetch user from the guild. They may not be a member.', ephemeral: true });
        }

        // Check if the user is currently timed out
        if (!member.isCommunicationDisabled()) {
            return interaction.reply({ content: "This user is not currently timed out.", ephemeral: true });
        }

        try {
            // Remove the timeout by setting the timeout duration to null
            await member.timeout(null);

            interaction.reply({ content: `${user.username} has been untimedout.`, ephemeral: false });
            
            // Notify the user they have been unmuted
            await user.send(`Your timeout in ${interaction.guild.name} has been removed.`).catch(error => console.error(`Could not send DM to ${user.username}:`, error));
        } catch (error) {
            console.error('Error removing timeout:', error);
            interaction.reply({ content: "An error occurred while removing the timeout for the user.", ephemeral: true });
        }
    },
};