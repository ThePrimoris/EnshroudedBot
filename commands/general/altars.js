const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('altars')
        .setDescription('Provides information about Flame Altars and Levels.'),
    async execute(interaction) {
        const embedDescription = `
- **Altar levels increase maximum size the altar covers, require varying flame levels and cost Shroud Cores.**
- **Flame levels are shared between all altars, they increase altar capacity, shroud levels and award attribute bonuses and shroud timer increase.**

**How do you remove an Altar?**
- Interact with **E** and *Extinguish the Flame*
- A 30 second timer will begin (You can cancel this action before the timer runs out).
- After 30 seconds the altar disappears.
- The world flame remains the same.
- No materials are refunded.
- Any altar level is lost.
        `;

        const embedFooter = `
Any structures or items created by the player within the flame radius remain for 30 minutes, or if the player logs out/server is reset. Everything in the previous radius is reset.
        `;

        const embed = new EmbedBuilder()
            .setTitle('How do Flame Altars & Flame Levels work?')
            .setDescription(embedDescription)
            .setColor('#3f9dd5')
            .setThumbnail('https://enshrouded.wiki.gg/wiki/File:Flame_Altar.png')
            .setFooter({ text: embedFooter.trim() });

        await interaction.reply({ embeds: [embed] });
    },
};
