const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { UserLevel } = require('./path/to/your/models'); // Adjust the path as necessary

module.exports = {
    data: new SlashCommandBuilder()
        .setName('xp')
        .setDescription('Displays your current level and XP.'),
    async execute(interaction) {
        const user_id = interaction.user.id;
        const userData = await UserLevel.findOne({ where: { user_id } });

        if (!userData) {
            await interaction.reply("It looks like you don't have any XP yet. Start participating to earn some!");
            return;
        }

        // Ensure XP for the next level is a whole number
        const xpForNextLevel = Math.round(100 * ((userData.level + 1) ** 1.5) - userData.xp);

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}`) // User's name as the title
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                { name: 'Level', value: `Current Level: ${userData.level}`, inline: false },
                { name: 'XP Needed for Next Level', value: `XP required for next level: ${xpForNextLevel}`, inline: false },
                { name: 'Total XP', value: `Total XP: ${userData.xp}`, inline: false }
            )
            .setFooter({ text: 'Keep being active to level up!', iconURL: interaction.client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed] });
    },
};
