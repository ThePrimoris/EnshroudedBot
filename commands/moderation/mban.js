const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { UserBan } = require('../../database'); // Ensure this path is correct

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mban')
        .setDescription('Ban multiple users from the server.')
        .addStringOption(option =>
            option.setName('userids')
                .setDescription('The user IDs to be banned, separated by spaces.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the ban.')
                .setRequired(true)),
    requiredPermissions: ['BanMembers'],
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            await interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
            return;
        }

        const userIdsString = interaction.options.getString('userids');
        const reason = interaction.options.getString('reason');
        const userIds = userIdsString.split(' ').filter(id => !isNaN(id) && id);

        if (userIds.length === 0) {
            await interaction.reply({ content: "No valid user IDs provided.", ephemeral: true });
            return;
        }

        // Defer the reply if expecting a delay in processing
        await interaction.deferReply({ ephemeral: false });

        // Perform the bans asynchronously and collect results
        const banPromises = userIds.map(userId => banUser(interaction, userId, reason));
        const results = await Promise.allSettled(banPromises);

        // Process results to generate response message
        const successfulBans = results.filter(result => result.status === 'fulfilled').length;
        const failedBans = results.length - successfulBans;

        await interaction.followUp({ content: `Ban attempt completed. Successful bans: ${successfulBans}. Failed: ${failedBans}.`, ephemeral: false });
    },
};

async function banUser(interaction, userId, reason) {
    try {
        await interaction.guild.members.ban(userId, { reason });
        await UserBan.create({
            userId: userId,
            issuerId: interaction.user.id,
            issuerName: interaction.user.username,
            reason: reason,
            date: new Date()
        });
        console.log(`Successfully banned ${userId}.`);
    } catch (error) {
        console.error(`Failed to ban user with ID ${userId}:`, error);
        // This error is caught by Promise.allSettled, so just throw it
        throw error;
    }
}
