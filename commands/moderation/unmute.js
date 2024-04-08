const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a previously muted user.')
        .addStringOption(option => 
            option.setName('user')
                .setDescription('The ID of the user to unban.')
                .setRequired(true)),
    category: 'moderation',
    async execute(interaction) {
        // Check for ManageMessages permission before proceeding with the /unmute command
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
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

        // Check if the user has the Muted role
        const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
        if (!muteRole) {
            return interaction.reply({ content: "Mute role not found. Please create a 'Muted' role.", ephemeral: true });
        }
        if (!member.roles.cache.has(muteRole.id)) {
            return interaction.reply({ content: "This user is not currently muted.", ephemeral: true });
        }

        try {
            await member.roles.remove(muteRole);
            interaction.reply({ content: `${user.username} has been unmuted.`, ephemeral: false });
            
            // Notify the user they have been unmuted
            await user.send(`You have been unmuted in ${interaction.guild.name}.`).catch(error => console.error(`Could not send DM to ${user.username}:`, error));
        } catch (error) {
            console.error('Error unmuting user:', error);
            interaction.reply({ content: "An error occurred while unmuting the user.", ephemeral: true });
        }
    },
};
