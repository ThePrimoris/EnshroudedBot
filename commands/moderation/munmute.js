const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('munmute')
        .setDescription('Unmute multiple previously muted users.')
        .addStringOption(option =>
            option.setName('users')
                .setDescription('The users to be unmuted, mentioned as @user1 @user2 etc.')
                .setRequired(true)),
    requiredPermissions: ['ManageMessages'],
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const userMentions = interaction.options.getString('users');
        const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
        if (!muteRole) {
            return interaction.reply({ content: "Mute role not found. Please create a 'Muted' role.", ephemeral: true });
        }

        const userIds = userMentions.match(/<@!?(\d+)>/g)?.map(mention => mention.replace(/\D/g, ''));

        if (!userIds || userIds.length === 0) {
            return interaction.reply({ content: "No valid users mentioned.", ephemeral: true });
        }

        let unmutedUsers = [];
        let failedUnmute = [];

        for (const userId of userIds) {
            try {
                const member = await interaction.guild.members.fetch(userId);
                if (member.roles.cache.has(muteRole.id)) {
                    await member.roles.remove(muteRole);
                    unmutedUsers.push(member.user.username);
                    
                    // Optionally, notify the user they have been unmuted
                    await member.send(`You have been unmuted in ${interaction.guild.name}.`).catch(error => console.error(`Could not send DM to ${member.user.username}:`, error));
                } else {
                    failedUnmute.push(member.user.username + " (not muted)");
                }
            } catch (error) {
                console.error(`Error unmuting user with ID ${userId}:`, error);
                failedUnmute.push(`<@${userId}> (fetch error)`);
            }
        }

        // Construct the response message
        let responseMessage = '';
        if (unmutedUsers.length > 0) {
            responseMessage += `Unmuted users: ${unmutedUsers.join(', ')}. `;
        }
        if (failedUnmute.length > 0) {
            responseMessage += `Failed to unmute: ${failedUnmute.join(', ')}.`;
        }

        interaction.reply({ content: responseMessage || "No users were unmuted.", ephemeral: false });
    },
};
