const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const { UserWarning, UserNote, UserMute, UserBan } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Provides information about a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to get information about')
                .setRequired(true)),
    requiredPermissions: ['ManageMessages'],
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "You don't have the required permission (Manage Messages) to use this command.", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        let member;
        try {
            member = await interaction.guild.members.fetch(user.id);
        } catch (error) {
            console.error('Failed to fetch member:', error);
            return interaction.reply({ content: 'Failed to fetch user from the guild. They may not be a member.', ephemeral: true });
        }

        let numberOfWarnings, numberOfNotes, numberOfMutes, numberOfBans;
        try {
            numberOfWarnings = await UserWarning.count({ where: { userId: user.id } });
            numberOfNotes = await UserNote.count({ where: { userId: user.id } });
            numberOfMutes = await UserMute.count({ where: { userId: user.id } });
            numberOfBans = await UserBan.count({ where: { userId: user.id } });
        } catch (error) {
            console.error('Error fetching moderation data:', error);
            return interaction.reply({ content: 'Failed to fetch moderation data. Please try again later.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s Information`)
        .setDescription(`Details about ${user.username}`)
        .setColor(0x3498db)
        .setThumbnail(user.displayAvatarURL())
        .addFields(
            { name: '👤 Name', value: user.username, inline: true },
            { name: '🆔 ID', value: user.id, inline: true },
            { name: '🤖 Bot Account', value: user.bot ? 'Yes' : 'No', inline: true },
            { name: '🎭 Animated Avatar', value: user.avatar && user.avatar.startsWith('a_') ? 'Yes' : 'No', inline: true },
            { name: '🔗 Avatar URL', value: `[Click Here](${user.displayAvatarURL()})`, inline: true },
            { name: '🔖 Profile Link', value: `<@${user.id}>`, inline: true }
        )
        .addFields(
            { name: '🏷️ Nickname', value: member.nickname || 'None', inline: true },
            { name: '📅 Joined Server', value: member.joinedAt ? member.joinedAt.toDateString() : 'N/A', inline: true },
            { name: '🗓️ Account Created', value: user.createdAt.toDateString(), inline: true },
            { name: '📜 Moderation Summary', value: `⚠️ ${numberOfWarnings} Warnings\n📝 ${numberOfNotes} Notes\n🔇 ${numberOfMutes} Mutes\n🚫 ${numberOfBans} Bans`, inline: true }
        )
        .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        const warningsButton = new ButtonBuilder()
            .setCustomId(`viewWarnings_${user.id}`)
            .setLabel('View Warnings')
            .setStyle(ButtonStyle.Secondary);

        const notesButton = new ButtonBuilder()
            .setCustomId(`viewNotes_${user.id}`)
            .setLabel('View Notes')
            .setStyle(ButtonStyle.Secondary);

        const viewAllButton = new ButtonBuilder()
            .setCustomId(`viewModeration_${user.id}`)
            .setLabel('View All Moderation Actions')
            .setStyle(ButtonStyle.Primary);

        const actionRow = new ActionRowBuilder()
            .addComponents(warningsButton, notesButton, viewAllButton);

        await interaction.reply({ embeds: [embed], components: [actionRow] });
    },
};
