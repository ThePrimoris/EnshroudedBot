const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js'); // Import EmbedBuilder
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
                // Calculate XP required for the next level using the formula: 10 * (level + 1)^2
                const xpForNextLevel = 10 * ((userLevel.level + 1) ** 2); 
                const xpRequiredForNextLevel = xpForNextLevel - userLevel.xp;

                const embed = new EmbedBuilder()
                    .setColor(0x3498DB) // Set the color of the embed
                    .setTitle(interaction.user.username) // User's name as the title
                    .setThumbnail(interaction.user.displayAvatarURL()) // User's avatar
                    .setDescription(`**Current Level**: ${userLevel.level}\n**XP Required for Next Level**: ${xpRequiredForNextLevel}\n**Total XP**: ${userLevel.xp}`)
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
