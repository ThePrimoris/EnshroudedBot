const { SlashCommandBuilder } = require('discord.js');

const CATEGORY_ID = '1261551554566029313'; // Specified category ID
const cooldowns = new Map();

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

        const replyMessage = await interaction.reply({ content: `Voice channel created: ${voiceChannel} in ${category.name}`, ephemeral: true });

        // Set a timeout to delete the reply message after 30 seconds
        setTimeout(() => {
            replyMessage.delete().catch(console.error);
        }, 30000);

        // Set the cooldown
        cooldowns.set(user.id, Date.now());

        // Function to delete the channel when all users disconnect
        const monitorChannel = async () => {
            const checkIfEmpty = () => {
                if (voiceChannel.members.size === 0) {
                    voiceChannel.delete()
                        .then(() => {
                            console.log(`Deleted empty voice channel: ${voiceChannel.name}`);
                            cooldowns.delete(user.id); // Remove cooldown when the channel is deleted
                            guild.client.removeListener('voiceStateUpdate', listener); // Stop listening to voice state updates
                        })
                        .catch(console.error);
                }
            };

            const listener = (oldState, newState) => {
                // Check if the old state was in this voice channel and the new state is either disconnected or in a different channel
                if (oldState.channelId === voiceChannel.id && newState.channelId !== voiceChannel.id) {
                    checkIfEmpty();
                }
            };

            // Initial check if the channel is empty after the grace period
            checkIfEmpty();

            // Listen for voice state updates (join/leave events)
            guild.client.on('voiceStateUpdate', listener);
        };

        // Start monitoring after the grace period
        setTimeout(monitorChannel, 30000); // 30-second grace period
    },
};
