const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const { UserInfraction, UserNote } = require('../../database'); // Adjust the path as necessary

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Provides information about a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to get information about')
                .setRequired(true)),
    category: 'moderation',
    async execute(interaction) {
        // Check if the interacting user has the ManageMessages permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "You don't have the required permission (Manage Messages) to use this command.", ephemeral: true });
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

        let numberOfInfractions, numberOfNotes;
        try {
            // Attempt to fetch the actual number of infractions and notes for the user
            numberOfInfractions = await UserInfraction.count({ where: { userId: user.id } });
            numberOfNotes = await UserNote.count({ where: { userId: user.id } });
        } catch (error) {
            console.error('Error fetching data:', error);
            return interaction.reply({ content: 'Failed to fetch user data. Please try again later.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Information`)
            .setDescription(`Details about ${user.username}`)
            .setColor(0x3498db)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'Name', value: user.username, inline: true },
                { name: 'ID', value: user.id, inline: true },
                { name: 'Bot Account', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: 'Animated Avatar', value: user.avatar && user.avatar.startsWith('a_') ? 'Yes' : 'No', inline: true },
                { name: 'Avatar URL', value: `[Click Here](${user.displayAvatarURL()})`, inline: true },
                { name: 'Profile Link', value: `[Profile Link](https://discord.com/users/${user.id})`, inline: true },
                { name: 'Nickname', value: member.nickname || 'None', inline: true },
                { name: 'Joined Server', value: member.joinedAt ? member.joinedAt.toDateString() : 'N/A', inline: true },
                { name: 'Account Created', value: user.createdAt.toDateString(), inline: true },
                { name: 'Infractions', value: numberOfInfractions.toString(), inline: true },
                { name: 'Notes', value: numberOfNotes.toString(), inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        const infractionsButton = new ButtonBuilder()
            .setCustomId('view_infractions_' + user.id)
            .setLabel('View Infractions')
            .setStyle(ButtonStyle.Secondary);

        const notesButton = new ButtonBuilder()
            .setCustomId('view_notes_' + user.id)
            .setLabel('View Notes')
            .setStyle(ButtonStyle.Secondary);

        const actionRow = new ActionRowBuilder()
            .addComponents(infractionsButton, notesButton);

        await interaction.reply({ embeds: [embed], components: [actionRow] });
    },
};
