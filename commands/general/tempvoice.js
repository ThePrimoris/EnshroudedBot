const { SlashCommandBuilder } = require('discord.js');

const CATEGORY_ID = '1261551554566029313'; // Specified category ID
const ALLOWED_GUILD_ID = '1261550824568393789'; //Official Discord LFG

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
    async execute(interaction, client) {
        const guild = interaction.guild;

        // Check if the command is being used in the allowed server
        if (guild.id !== ALLOWED_GUILD_ID) {
            return interaction.reply({ content: 'This command is not available in this server.', ephemeral: true });
        }

        const userLimit = interaction.options.getInteger('userlimit');
        const user = interaction.user;

        // Ensure cooldowns and activeChannels are accessed from client
        const cooldowns = client.cooldowns || new Map();
        const activeChannels = client.activeChannels || new Map();

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
        client.cooldowns = cooldowns; // Update the client with the new cooldowns

        // Store channel in active channels map
        activeChannels.set(voiceChannel.id, { ownerId: user.id, creationTime: Date.now() });
        client.activeChannels = activeChannels; // Update the client with the new active channels

        // Monitor the channel via the voiceStateUpdate event
        const checkChannel = () => {
            if (voiceChannel.members.size === 0) {
                // Channel is empty; delete it
                voiceChannel.delete()
                    .then(() => {
                        console.log(`Deleted empty voice channel: ${voiceChannel.name}`);
                        cooldowns.delete(user.id); // Remove cooldown when the channel is deleted
                        activeChannels.delete(voiceChannel.id); // Remove from active channels map
                        client.cooldowns = cooldowns; // Update the client with the modified cooldowns
                        client.activeChannels = activeChannels; // Update the client with the modified active channels
                    })
                    .catch(console.error);
            }
        };

        // Run the initial check after 30 seconds
        setTimeout(checkChannel, 30000);
    },
};
