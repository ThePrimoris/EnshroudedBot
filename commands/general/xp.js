const { Client, Collection } = require('discord.js');
const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

// Import necessary modules
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

                // Prepare the class info for the embed
                const classInfo = userLevel.class ? `**Class**: ${userLevel.class}` : "**Class**: Not Assigned. You can select one in class-roles.";

                const embed = new EmbedBuilder()
                    .setColor(0x3498DB) // Set the color of the embed
                    .setTitle(interaction.user.username) // User's name as the title
                    .setThumbnail(interaction.user.displayAvatarURL()) // User's avatar
                    .setDescription(`**Current Level**: ${userLevel.level}\n**XP Required for Next Level**: ${xpRequiredForNextLevel}\n**Total XP**: ${userLevel.xp}\n${classInfo}`)
                    .setFooter({ text: 'Keep being active to level up!', iconURL: interaction.guild.iconURL() })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });

                // Check if the user has leveled up
                const previousLevel = userLevel.level;
                const xpToAdd = 0; // You might want to adjust this if you add XP in this function
                const newLevel = Math.floor(Math.sqrt((userLevel.xp + xpToAdd) / 10));

                if (newLevel > previousLevel) {
                    const channel = interaction.channel;
                    client.emit('levelUp', interaction.user, newLevel, channel);
                }
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

module.exports.client = client; // Export client for use in other files
