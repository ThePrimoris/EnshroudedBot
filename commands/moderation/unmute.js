const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'unmute',
        description: 'Unmute a previously muted user.',
        options: [
            {
                name: 'user',
                type: 'USER',
                description: 'The user to be unmuted.',
                required: true,
            },
        ],
    },
    async execute(interaction) {
        // Check for ManageRoles permission before proceeding with the /unmute command
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);

        // Check if the user has the Muted role
        const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
        if (!muteRole || !member.roles.cache.has(muteRole.id)) {
            return interaction.reply({ content: "This user is not currently muted.", ephemeral: true });
        }

        // Remove the Muted role from the user
        await member.roles.remove(muteRole)
            .then(() => {
                interaction.reply({ content: `${user.username} has been unmuted.`, ephemeral: true });
            })
            .catch(error => {
                console.error('Error unmuting user:', error);
                interaction.reply({ content: "An error occurred while unmuting the user.", ephemeral: true });
            });
    },
};
