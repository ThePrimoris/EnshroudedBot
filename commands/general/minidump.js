const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('minidump')
        .setDescription('Troubleshooting information for MiniDump errors.'),
    async execute(interaction) {
        const embedDescription = `
        The following steps have been developed by members of the Enshrouded Community to help guide you when resolving the "MiniDump" error message. Please read and follow each step closely.
        **Step 1: Verify game files via Steam**
        - How to verify your game files on Steam: [Click Here](https://help.steampowered.com/en/faqs/view/0C48-FCBD-DA71-93EB)
        - Check to see if this resolved the issue.


        **Step 2: Use Liandry's Tool**
        - Check the README on the site on how to use it. [Enshrouded Tool Fix](https://github.com/LiaNdrY/Enshrouded-Tool-Fix)
        - Check to see if this resolved the issue.


        **Step 3: Rename enshrouded_local.json**
        - Rename the fole located here: > "...\Steam\steamapps\common\Enshrouded\enshrouded_local.json" (will reset ingame settings)
        - Check to see if this resolved the issue.

        
        **Step 4: Clean reinstall GPU driver (with DDU)**
        - [Clean install with DDU](https://www.youtube.com/watch?v=v7KfnZ2wSog)
        `.trim();

        const embedFooter = `
If these steps did not resolve the issue, please head back to #troubleshooting and post logs, wait for feedback.
        `.trim();

        const embed = new EmbedBuilder()
            .setTitle('MiniDump Troubleshooting Steps') 
            .setDescription(embedDescription)
            .setColor('#3f9dd5')
            .setFooter({ text: embedFooter });

        try {
            await interaction.user.send({ embeds: [embed] });
            await interaction.reply({ content: 'I have sent you a DM with troubleshooting steps.', ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: 'I was unable to send you a DM. Please check your privacy settings.', ephemeral: true });
        }
    },
};
