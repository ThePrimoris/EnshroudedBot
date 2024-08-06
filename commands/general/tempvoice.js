const { SlashCommandBuilder } = require('discord.js');

const CATEGORY_ID = '1261551554566029313'; // Specified category ID
const cooldowns = new Map();
const activeChannels = new Map(); // Store active channels and their metadata

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-lobby')
        .setDescription('Create a temporary voice channel.')
        .addIntegerOption(option =>
            option.setName('userlimit')
            .setDescription('The user limit for the voice channel (2-16)')
            .setRequired(true)
            .setMinValue(2)
            .setMaxValue(16)),
    async execute(interaction) {
        const userLimit = interaction.options.getInteger('userlimit');
        const user = interaction.user;
        const guild = interaction.guild;

        // Check if the user is on cooldown
        if (cooldowns.has(user.id)) {
            const expirationTime = cooldowns.get(user.id) + 300000; // 5 minutes
            if (Date.now() < expirationTime) {
                const timeLeft = (expirationTime - Date.now()) / 1000;
                return interaction.reply(`Please wait ${timeLeft.toFixed(1)} more seconds before reusing the \`/create-lobby\` command.`);
            }
        }

        // Fetch the category
        const category = guild.channels.cache.get(CATEGORY_ID);

        // Check if the user already has a channel
        const existingChannel = guild.channels.cache.find(channel => channel.name === `${user.username}'s Channel` && channel.parentId === CATEGORY_ID);
        if (existingChannel) {
            return interaction.reply('You already have a voice channel.');
        }

        // Create the voice channel
        const voiceChannel = await guild.channels.create({
            name: `${user.username}'s Channel`,
            type: 2, // 2 corresponds to voice channel type
            parent: CATEGORY_ID,
            userLimit: userLimit,
        });

        await interaction.reply({ content: `Voice channel created: ${voiceChannel} in ${category.name}`, ephemeral: true });

        // Set the cooldown
        cooldowns.set(user.id, Date.now());

        // Store channel in active channels map
        activeChannels.set(voiceChannel.id, { ownerId: user.id, creationTime: Date.now() });

        // Monitor the channel via the voiceStateUpdate event
        const checkChannel = () => {
            if (voiceChannel.members.size === 0) {
                // Channel is empty; delete it
                voiceChannel.delete()
                    .then(() => {
                        console.log(`Deleted empty voice channel: ${voiceChannel.name}`);
                        cooldowns.delete(user.id); // Remove cooldown when the channel is deleted
                        activeChannels.delete(voiceChannel.id); // Remove from active channels map
                    })
                    .catch(console.error);
            }
        };

        // Run the initial check after 30 seconds
        setTimeout(checkChannel, 30000);
    },
};

// Listen for voice state updates globally
client.on('voiceStateUpdate', (oldState, newState) => {
    // Get the channel ID from the old state (where the user is leaving)
    const oldChannelId = oldState.channelId;

    // If a user leaves a channel, and it's in the active channels map, check if it's empty
    if (oldChannelId && activeChannels.has(oldChannelId)) {
        const voiceChannel = oldState.guild.channels.cache.get(oldChannelId);
        if (voiceChannel) {
            setTimeout(() => {
                if (voiceChannel.members.size === 0) {
                    voiceChannel.delete()
                        .then(() => {
                            console.log(`Deleted empty voice channel: ${voiceChannel.name}`);
                            cooldowns.delete(activeChannels.get(oldChannelId).ownerId); // Remove cooldown
                            activeChannels.delete(oldChannelId); // Remove from active channels map
                        })
                        .catch(console.error);
                }
            }, 30000); // 30-second grace period after last user leaves
        }
    }
});
