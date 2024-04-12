const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { UserBan } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to be banned.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the ban.')
                .setRequired(true)),
    requiredPermissions: ['BanMembers'],
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const currentTime = new Date();
        const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        try {
            // Attempt to message the user before banning
            await user.send(`You have been banned from ${interaction.guild.name} for the following reason: ${reason}`).catch(error => console.error(`Could not send DM to ${user.tag}:`, error));

            // Ban the user
            await interaction.guild.members.ban(user.id, { reason });

            // Log the ban action
            await UserBan.create({
                userId: user.id,
                issuerId: interaction.user.id,
                issuerName: interaction.user.username,
                reason: reason,
                date: new Date()
            });

            // Successfully reply about the ban
            await interaction.reply({ content: `[${formattedTime}] 🔨 ${user.tag} (${user.id}) has been banned from the server by ${interaction.user.tag} for: ${reason}.` });
        } catch (error) {
            console.error(`Error during the ban command:`, error);
            // Assuming the ban was successful but the reply failed, attempt to send a follow-up message or log it differently
            try {
                await interaction.followUp({ content: "The ban command was processed, but an error occurred with the follow-up action.", ephemeral: true });
            } catch (followUpError) {
                console.error(`Error sending follow-up message:`, followUpError);
            }
        }
    },
};
