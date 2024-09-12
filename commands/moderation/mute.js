const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { UserMute } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeouts a user for a specified duration')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Select the duration for the timeout')
                .setRequired(true)
                .addChoices(
                    { name: '60 seconds', value: '60s' },
                    { name: '5 minutes', value: '5m' },
                    { name: '10 minutes', value: '10m' },
                    { name: '1 hour', value: '1h' },
                    { name: '1 day', value: '1d' },
                    { name: '1 week', value: '1w' }
                ))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the timeout')
                .setRequired(false)),
    requiredPermissions: ['ModerateMembers'],
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const durationString = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        // Fetch the guild member object for the target user
        const targetMember = await interaction.guild.members.fetch(user.id);
        if (!targetMember) {
            return interaction.reply({ content: 'Could not find the user in this guild.', ephemeral: true });
        }

        // Check if the target user has a higher role than the command issuer
        if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ content: "You cannot timeout a user with equal or higher permissions than yourself.", ephemeral: true });
        }

        const duration = parseDuration(durationString);
        if (!duration) {
            return interaction.reply({ content: "Invalid time format.", ephemeral: true });
        }

        try {
            // Apply timeout using Discord's timeout functionality
            await targetMember.timeout(duration, reason);
            await user.send(`You have been timed out in ${interaction.guild.name} for ${durationString}. Reason: ${reason}`).catch(console.error);

            // Log the mute action
            await UserMute.create({
                userId: user.id,
                issuerId: interaction.user.id,
                issuerName: interaction.user.username,
                reason: reason,
                duration: durationString,
                timestamp: new Date()
            });

            await interaction.reply({ content: `${user.tag} has been timed out by <@${interaction.user.id}> for \`${durationString}\`. Reason: \`${reason}\`.`, ephemeral: false });
        } catch (error) {
            console.error('Error executing timeout command:', error);
            await interaction.reply({ content: 'Failed to timeout the user. Please make sure I have the right permissions and try again.', ephemeral: true });
        }
    },
};

function parseDuration(time) {
    const regex = /^(\d+)([smhdw])$/;
    const match = time.match(regex);
    if (!match) return null;

    const duration = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
        case 's': return duration * 1000;        // seconds to milliseconds
        case 'm': return duration * 60_000;      // minutes to milliseconds
        case 'h': return duration * 3_600_000;   // hours to milliseconds
        case 'd': return duration * 86_400_000;  // days to milliseconds
        case 'w': return duration * 604_800_000; // weeks to milliseconds
        default: return null;
    }
}