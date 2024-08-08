const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

const channelId = '1060216335684087878'; // Troubleshooting channel ID

const embeds = {
    '4gb': new EmbedBuilder()
        .setTitle('Enshrouded Minimum Requirements')
        .setDescription(`
We have no official word on the game's minimum requirements at Early Access launch, but the developers are working hard to optimize the game for lower-end systems.

Please grab the 4GBVRAM GPU gane role in <id:customize> to be notified of any updates on this topic.
        `)
        .setColor('#3f9dd5'),

    'altars': new EmbedBuilder()
        .setTitle('How do Flame Altars & Flame Levels work?')
        .setDescription(`
- **Altar levels increase maximum size the altar covers, require varying flame levels and cost Shroud Cores.**
- **Flame levels are shared between all altars, they increase altar capacity, shroud levels and award attribute bonuses and shroud timer increase.**

**How do you remove an Altar?**
- Interact with **E** and *Extinguish the Flame*
- A 30 second timer will begin (You can cancel this action before the timer runs out).
- After 30 seconds the altar disappears.
- The world flame remains the same.
- No materials are refunded.
- Any altar level is lost.
        `)
        .setColor('#3f9dd5')
        .setThumbnail('https://enshrouded.wiki.gg/images/9/96/Flame_Altar.png')
        .setFooter({ text: 'Any structures or items created by the player within the flame radius remain for 30 minutes, or if the player logs out/server is reset. Everything in the previous radius is reset.' }),

    'minidump': [
        new EmbedBuilder()
            .setTitle('MiniDump Troubleshooting Steps') 
            .setDescription(`
        The following steps have been developed by members of the Enshrouded Community to help guide you when resolving the "MiniDump" error message. Please read and follow each step closely.

        **Step 1: Verify game files via Steam**
        - How to verify your game files on Steam: [Click Here](https://help.steampowered.com/en/faqs/view/0C48-FCBD-DA71-93EB)
        - Check to see if this resolved the issue.

        **Step 2: Use Liandry's Tool**
        - Check the README on the site on how to use it. [Enshrouded Tool Fix](https://github.com/LiaNdrY/Enshrouded-Tool-Fix)
        - Check to see if this resolved the issue.

        **Step 3: Rename enshrouded_local.json**
        - Rename the file located here: > "...\Steam\steamapps\common\Enshrouded\enshrouded_local.json" (will reset ingame settings)
        - Check to see if this resolved the issue.

        **Step 4: Clean reinstall GPU driver (with DDU)**
        - [Clean install with DDU](https://www.youtube.com/watch?v=v7KfnZ2wSog)
        `)
            .setColor('#3f9dd5'),

        new EmbedBuilder()
            .setTitle('Minidump Common Issues and Fixes') 
            .setDescription(`
        Not all MiniDump issues are the same cause, this error be caused by multiple things...There is not "one-size fits all" solution. That being said, we have fond some common fixes, and troubleshooting steps (like above).

        > Player's report removing any excessive honey and plants has minimized the chance of crashing. May need to repeat when reloading.
        `)
            .setColor('#3f9dd5')
    ],

    'upvote': new EmbedBuilder()
        .setTitle('Official Enshrouded Feature Suggestions')
        .setDescription(`
**What is Feature Upvote?**
- It is a site where players can make suggestions for the game and upvote other suggestions for a chance to get them implemented.
- **Please search for your suggestion before submitting to avoid duplicates.**

**Suggestions may be open/closed at any time to review backlogs.**
- Upvote suggestions you like to increase their chances of being implemented.

**Enshrouded Feature Upvote: [Click Here](https://enshrouded.featureupvote.com/)**
        `)
        .setColor('#3f9dd5')
        .setThumbnail('https://icons.veryicon.com/png/o/miscellaneous/kara/upvote-1.png')
        .setFooter({ text: 'Keep suggestions to one per ticket, we will delete any tickets containing general feedback, multiple suggestions or duplicates (as that defeats the purpose of the site.)' }),

    'wipes': new EmbedBuilder()
        .setTitle('Enshrouded Server & Character Wipes')
        .setDescription(`
As of current writing (6 Febuary 2024) we do not have any plans to force wipes at any time. However, with the Enshrouded being in early access and the fact that a LOT of things will change between now and full release, we cannot guarantee that there may or may not be a major update
that requires old saves to break.

Also being that so much is changing, there is always a chance that an update may break old saves, so we recommend backing up saves regularly that you care about. As this would be something that could be the end of the world for players.

We will do our best to avoid this, and it's not something we're planning intentionally we cannot guarantee this will "never happen" either since there are a lot of unknown variables in the future.
        `)
        .setColor('#3f9dd5')
        .setFooter({ text: 'REMINDER THIS IS AN EARLY ACCESS GAME.' }),

    'logs': new EmbedBuilder()
        .setTitle('Finding & Sending your Logs')
        .setDescription(`
**Finding your logs:**
For better and faster troubleshooting, please share game logs along with your message.

**Open File Explorer**
- Navigate to your Steam folder, by default it should be in *C:\Program Files (x86)\Steam*.
- Find the following file:
[...] \Steam\steamapps\common\Enshrouded\enshrouded.log"

⚠️ If you do not have "show known file extensions" in Windows Explorer active, the relevant file will appear only as "enshrouded", with no extension and file type "Text Document".

**Copy and Paste the log file into Discord**
- Head over to <#${channelId} and paste the log file into the channel.
`)
.setColor('#3f9dd5')
.setFooter({ text: `Troubleshooting in Discord is conducted by community volunteers/AutoModerationRuleKeywordPresetType. Treat them with respect, and appreciation PartialTextBasedChannel.` })
};

// Export the command module
module.exports = {
    data: new SlashCommandBuilder()
        .setName('faq')
        .setDescription('Sends a FAQ embed based on the selected option.')
        .addStringOption(option => 
            option.setName('embed')
                .setDescription('Select an FAQ option')
                .setRequired(true)
                .addChoices(
                    { name: '4GB VRAM', value: '4gb' },
                    { name: 'Flame Altars & Levels', value: 'altars' },
                    { name: 'MiniDump Troubleshooting', value: 'minidump' },
                    { name: 'Feature Upvote', value: 'upvote' },
                    { name: 'Wipes', value: 'wipes' },
                    { name: 'Logs', value: 'logs' }
                )),
    async execute(interaction) {
        const selectedEmbed = interaction.options.getString('embed');

        if (selectedEmbed === 'minidump') {
            try {
                await interaction.user.send({ embeds: embeds[selectedEmbed] });
                await interaction.reply({ content: 'I have sent you a DM with troubleshooting steps and additional resources.', ephemeral: true });
            } catch (error) {
                await interaction.reply({ content: 'I was unable to send you a DM. Please check your privacy settings.', ephemeral: true });
            }
        } else if (embeds[selectedEmbed]) {
            await interaction.reply({ embeds: [embeds[selectedEmbed]] });
        } else {
            await interaction.reply({ content: 'Invalid embed option selected.', ephemeral: true });
        }
    },
};
