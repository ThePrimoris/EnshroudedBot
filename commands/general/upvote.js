const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('upvote')
        .setDescription('Enshrouded Features upvote link.'),
    async execute(interaction) {
        const embedDescription = `
**What is Feature Upvote?**
- It is a site where players can make suggestions for the game and upvote other suggestions for a chance to get them implemented.
- **Please search for your suggestion before submitting to avoid duplicates.**

**Suggestions may be open/closed at any time to review backlogs.**
- Upvote suggestions you like to increase their chances of being implemented.

**Enshrouded Feature Upvote: [Click Here](https://enshrouded.featureupvote.com/)**
        `.trim();

        const embedFooter = `
Keep suggestions to one per ticket, we will delete any tickets containing general feedback, multiple suggestions or duplicates (as that defeats the purpose of the site.)
        `.trim();

        const embed = new EmbedBuilder()
            .setTitle('Official Enshrouded Feature Suggestions')
            .setDescription(embedDescription)
            .setColor('#3f9dd5')
            .setThumbnail('https://icons.veryicon.com/png/o/miscellaneous/kara/upvote-1.png')
            .setFooter({ text: embedFooter });

        await interaction.reply({ embeds: [embed] });
    },
};
