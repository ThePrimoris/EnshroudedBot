const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { UserBan } = require('../../database');

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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempban')
        .setDescription('Temporarily ban a user from the server.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to be banned.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the ban.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration of the ban')
                .setRequired(true)
                .addChoices(
                    { name: '1 day', value: '1d' },
                    { name: '2 days', value: '2d' },
                    { name: '5 days', value: '5d' },
                    { name: '7 days', value: '7d' }
                )),
    requiredPermissions: ['BanMembers'],
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const durationString = interaction.options.getString('duration');
        const durationMs = parseDuration(durationString);

        if (!durationMs) {
            return interaction.reply({ content: "Invalid duration. Please use the format #d, #h, or #m.", ephemeral: true });
        }

        const unbanDate = new Date(Date.now() + durationMs);
        const formattedTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        try {
            // Attempt to message the user before banning
            await user.send(`You have been temporarily banned from ${interaction.guild.name} for ${durationString} for the following reason: ${reason}`).catch(error => console.error(`Could not send DM to ${user.tag}:`, error));
            
            // Ban the user
            await interaction.guild.members.ban(user.id, { reason });

            // Log the ban action
            await UserBan.create({
                userId: user.id,
                issuerId: interaction.user.id,
                issuerName: interaction.user.username,
                reason: reason,
                duration: durationString,
                date: new Date(),
                unbanDate: unbanDate
            });

            // Schedule unban
            setTimeout(async () => {
                try {
                    await interaction.guild.members.unban(user.id, 'Tempban duration expired');
                } catch (unbanError) {
                    console.error('Failed to unban:', unbanError);
                }
            }, durationMs);

            await interaction.reply({ content: `\`[${formattedTime}]\` ${user.tag} \`(${user.id})\` has been temporarily banned from the server by <@${interaction.user.id}> for ${durationString} due to: \`${reason}\`.` });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "Failed to ban the user. They might have a higher role than me or I lack the permission to ban them.", ephemeral: true });
        }
    },
};
