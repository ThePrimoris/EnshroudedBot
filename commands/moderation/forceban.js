const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forceban')
        .setDescription('Ban a user not in the server by their ID.')
        .addStringOption(option => 
            option.setName('userid')
                .setDescription('The ID of the user to ban.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for the ban.')
                .setRequired(false)), // Making reason optional here
    requiredPermissions: ['BanMembers'],
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
        }

        const userId = interaction.options.getString('userid');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const currentTime = new Date();
        const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        try {
            await interaction.guild.members.ban(userId, { reason });
            await interaction.reply({ content: `\`[${formattedTime}]\` The user with ID \`${userId}\` has been banned by <@${interaction.user.id}> for: \`${reason}\`.` });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Failed to ban the user. Please make sure the ID is correct and I have the permission to ban them.", ephemeral: true });
        }
    },
};
