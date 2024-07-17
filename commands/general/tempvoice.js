const { SlashCommandBuilder } = require('discord.js');

const CATEGORY_ID = '1261551554566029313'; // Specified category ID
const cooldowns = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('Temp Voice Channel')
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
                return interaction.reply(`Please wait ${timeLeft.toFixed(1)} more seconds before reusing the \`/create\` command.`);
            }
        }

        // Check if the user already has a channel
        const existingChannel = guild.channels.cache.find(channel => channel.name === `${user.username}'s Channel` && channel.parentId === CATEGORY_ID);
        if (existingChannel) {
            return interaction.reply('You already have a voice channel.');
        }

        // Create the voice channel
        try {
            const voiceChannel = await guild.channels.create({
                name: `${user.username}'s Channel`,
                type: 2, // 2 is the type for voice channel
                parent: CATEGORY_ID,
                userLimit: userLimit,
            });

            await interaction.reply(`Voice channel created: ${voiceChannel} in category ${CATEGORY_ID}`);

            // Set the cooldown
            cooldowns.set(user.id, Date.now());

            // Function to delete the channel if it is empty for more than 2 minutes
            const checkIfEmpty = async () => {
                if (voiceChannel.members.size === 0) {
                    await voiceChannel.delete();
                    console.log(`Deleted empty voice channel: ${voiceChannel.name}`);
                    cooldowns.delete(user.id); // Remove cooldown when the channel is deleted
                } else {
                    setTimeout(checkIfEmpty, 120000); // Check again in 2 minutes
                }
            };

            // Start the check
            setTimeout(checkIfEmpty, 120000); // Start the initial check in 2 minutes

        } catch (error) {
            console.error('Error creating voice channel:', error);
            return interaction.reply('There was an error trying to create the voice channel. Please ensure the bot has the required permissions.');
        }
    },
};
