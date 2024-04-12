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
        const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });


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

            await interaction.reply({ content: `\`[${formattedTime}]\` ${user.tag} \`(${user.id})\` has been banned from the server by <@${interaction.user.id}> for: \`${reason}\`.` });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Failed to ban the user. They might have a higher role than me or I lack the permission to ban them.", ephemeral: true });
        }
    },
};
