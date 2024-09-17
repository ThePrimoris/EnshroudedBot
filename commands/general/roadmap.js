const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roadmap')
        .setDescription('Enshrouded Roadmap'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Enshrouded Roadmap')
            .setDescription('Here is the current roadmap for Enshrouded.')
            .setColor('#3f9dd5')
            .setImage('https://i.imgur.com/KEd5DIx.jpeg') // Replace with your image URL
            .setFooter({ text: 'Roadmap current as of: 13 March 2024' }) // Customize footer
            .setTimestamp(); // Optional: shows when the embed was created

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
