const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wipes')
        .setDescription('Information about Enshrouded and wipes.'),
    async execute(interaction) {
        const embedDescription = `
As of current writing (6 Febuary 2024) we do not have any plans to force wipes at any time. However, with the Enshrouded being in early access and the fact that a LOT of things will change between now and full release, we cannot guarantee that there may or may not be a major update
that requires old saves to break.

Also being that so much is changing, there is always a chance that an update may break old saves, so we recommend backing up saves regularly that you care about. As this would be something that could be the end of the world for players.

We will do our best to avoid this, and it's not something we're planning intentionally we cannot guarantee this will "never happen" either since there are a lot of unknown variables in the future.
        `;

        const embedFooter = `
REMINDER THIS IS AN EARLY ACCESS GAME.
        `;

        const embed = new EmbedBuilder()
            .setTitle('Enshrouded Server & Character Wipes')
            .setDescription(embedDescription)
            .setColor('#3f9dd5')
            .setFooter({ text: embedFooter.trim() });

        await interaction.reply({ embeds: [embed] });
    },
};
