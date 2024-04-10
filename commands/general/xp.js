const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { UserLevel } = require('../../database'); // Adjust path as necessary

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

        const xpForNextLevel = 100 * ((userData.level + 1) ** 1.5) - userData.xp;
        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s XP Info`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                { name: 'Current Level', value: `${userData.level}`, inline: true },
                { name: 'XP For Next Level', value: `${xpForNextLevel}`, inline: true },
                { name: 'Total XP', value: `${userData.xp}`, inline: true }
            )
            .setFooter({ text: 'Keep being active to level up!', iconURL: interaction.client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [embed] });
    },
};
