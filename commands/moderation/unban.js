const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
    .addStringOption(option => 
        option.setName('user_id')
            .setDescription('The ID of the user to unban.')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('reason')
            .setDescription('The reason for the unban.')
            .setRequired(true)),
    requiredPermissions: ['BanMembers'],
    category: 'moderation',
    async execute(interaction) {
        // Check for BanMembers permission before proceeding with the /unban command
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const userId = interaction.options.getString('user_id');
        const reason = interaction.options.getString('reason'); // Reason is now required
        const currentTime = new Date();
        const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        try {
            await interaction.guild.members.unban(userId, { reason });
            await interaction.reply({ content: `\`[${formattedTime}]\` User with ID: \`${userId}\` has been unbanned by <@${interaction.user.id}> for the following reason: \`${reason}\`.` }); // Notification is visible to everyone
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Failed to unban the user. They might not be banned, or I might lack the permission to unban them.", ephemeral: true });
        }
    },
};
