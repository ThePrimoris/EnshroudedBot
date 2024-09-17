const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roadmap')
        .setDescription('Enshrouded Roadmap'),
    category: 'general',
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Enshrouded Roadmap')
            .setDescription('The current roadmap for Enshrouded.')
            .setColor('#3f9dd5')
            .setThumbnail('https://i.imgur.com/Cah6itb.png')
            .addFields(
                { name: 'Don\'t see a feature you want on the roadmap?', value: 'Create a suggestion on [Featureupvote](https://enshrouded.featureupvote.com/)!', inline: true }
            )
            .setImage('https://i.imgur.com/KEd5DIx.jpeg') // Replace with your image URL
            .setFooter({ text: 'Roadmap current as of: 13 March 2024' }) // Customize footer

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
