const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { UserLevel } = require('../../database/index.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('Check your XP and level!'),
    category: 'general',
    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const userLevel = await UserLevel.findByPk(userId);

            if (userLevel) {
                // Calculate XP required for the next level based on the level calculation formula
                const xpForNextLevel = ((userLevel.level + 1) ** 2) * 100; // Adjusted to align with level calculation
                const xpRequiredForNextLevel = xpForNextLevel - userLevel.xp;

                const classInfo = userLevel.class ? `**Class**: ${userLevel.class}` : "**Class**: Not Assigned. You can select one in class-roles.";

                const embed = new EmbedBuilder()
                    .setColor(0x3498DB)
                    .setTitle(interaction.user.username)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setDescription(`**Current Level**: ${userLevel.level}\n**XP Required for Next Level**: ${xpRequiredForNextLevel}\n**Total XP**: ${userLevel.xp}\n${classInfo}`)
                    .setFooter({ text: 'Keep being active to level up!', iconURL: interaction.guild.iconURL() })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                await interaction.reply({
                    content: "Couldn't retrieve your XP and level. Please try again later.",
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error executing /xp command:', error);
            await interaction.reply({
                content: 'An error occurred while processing your command. Please try again later.',
                ephemeral: true
            });
        }
    },
};
