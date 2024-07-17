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
            const expirationTime = cooldowns.get(user.id) + 300000; // 5 minutes in milliseconds
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
            type: 2, // 2 is the type for voice channel
            parent: CATEGORY_ID,
            userLimit: userLimit,
        });

        const replyMessage = await interaction.reply(`Voice channel created: ${voiceChannel.name} in ${category.name}`);

        // Set a timeout to delete the reply message after 30 seconds
        setTimeout(() => {
            replyMessage.delete().catch(console.error);
        }, 30000);

        // Set the cooldown
        cooldowns.set(user.id, Date.now());

        // Function to delete the channel if it is empty for more than 30 seconds
        const checkIfEmpty = async () => {
            if (voiceChannel.members.size === 0) {
                await voiceChannel.delete();
                console.log(`Deleted empty voice channel: ${voiceChannel.name}`);
                cooldowns.delete(user.id); // Remove cooldown when the channel is deleted
            } else {
                setTimeout(checkIfEmpty, 30000); // Check again in 30 seconds
            }
        };

        // Start the check
        setTimeout(checkIfEmpty, 30000); // Start the initial check in 30 seconds
    },
};