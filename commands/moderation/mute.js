const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { UserMute } = require('../../database'); // Make sure this path matches your actual file structure

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mutes a user for a specified duration')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to mute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('The duration of the mute (#d for days, #h for hours, #m for minutes)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the mute')
                .setRequired(false)),
    requiredPermissions: ['ManageMessages'],
    category: 'moderation',
    async execute(interaction) {
        // Check for ManageMessages permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
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
            return interaction.reply({ content: "You cannot mute a user with equal or higher permissions than yourself.", ephemeral: true });
        }

        const duration = parseDuration(durationString);
        if (!duration) {
            return interaction.reply({ content: "Invalid time format. Use #d for days, #h for hours, or #m for minutes.", ephemeral: true });
        }

        const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
        if (!muteRole) {
            return interaction.reply({ content: "Mute role not found. Please create a 'Muted' role.", ephemeral: true });
        }

        try {
            await targetMember.roles.add(muteRole, reason);
            await user.send(`You have been muted in ${interaction.guild.name} for ${durationString}. Reason: ${reason}`).catch(console.error);

            // Log the mute action
            await UserMute.create({
                userId: user.id,
                issuerId: interaction.user.id,
                issuerName: interaction.user.username,
                reason: reason,
                duration: durationString,
                timestamp: new Date()
            });

            setTimeout(async () => {
                try {
                    const freshMember = await interaction.guild.members.fetch(user.id);
                    if (freshMember.roles.cache.has(muteRole.id)) {
                        await freshMember.roles.remove(muteRole, 'Mute duration expired');
                        await user.send(`You have been unmuted in ${interaction.guild.name}.`).catch(console.error);
                        await interaction.followUp({ content: `${user.username} has been unmuted.`, ephemeral: false });
                    }
                } catch (error) {
                    console.error('Failed to unmute:', error);
                }
            }, duration);

            await interaction.reply({ content: `${user.username} has been muted for ${durationString}. Reason: ${reason}`, ephemeral: false });
        } catch (error) {
            console.error('Error executing mute command:', error);
            await interaction.reply({ content: 'Failed to mute the user. Please make sure I have the right permissions and try again.', ephemeral: true });
        }
    },
};

function parseDuration(time) {
    const regex = /^(\d+)([dhm])$/;
    const match = time.match(regex);
    if (!match) return null;

    const duration = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
        case 'd': return duration * 86_400_000; // days in milliseconds
        case 'h': return duration * 3_600_000;  // hours in milliseconds
        case 'm': return duration * 60_000;     // minutes in milliseconds
        default: return null;
    }
}
