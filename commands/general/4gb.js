const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('4gb')
        .setDescription('Information about 4GB of VRAM in Early Access'),
    async execute(interaction) {
        const embedDescription = `
We have no official word on the game's minimum requirements at Early Access launch, but the developers are working hard to optimize the game for lower-end systems.

Please grab the 4GBVRAM GPU gane role in **#Channels & Roles** to be notified of any updates on this topic.
        `;

        const embed = new EmbedBuilder()
            .setTitle('Enshrouded Minimum Requirements')
            .setDescription(embedDescription)
            .setColor('#3f9dd5')

        await interaction.reply({ embeds: [embed] });
    },
};
