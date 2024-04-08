const { addXP } = require('../database/index'); // Adjust the path as needed

// Define your censored words or phrases
const censoredWords = ['fuck', 'shit', ')[']; // Add your words/phrases here

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignore messages from bots
        if (message.author.bot) return;

        // Check if the message contains any censored words
        const foundWord = censoredWords.find(word => message.content.toLowerCase().includes(word.toLowerCase()));

        if (foundWord) {
            // Attempt to delete the original message
            try {
                await message.delete();
                const logChannel = message.guild.channels.cache.find(channel => channel.name === 'censor-log');
                if (logChannel) {
                    // Formatting the timestamp to HH:MM
                    const timeStamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

                    const censorMessage = `[${timeStamp}] Censored message by ${message.author.username} (${message.author.id}) in ${message.channel.name}, '${foundWord}' is not allowed.\n\n\`${message.content}\``;
                    await logChannel.send({ content: censorMessage });
                }
            } catch (error) {
                console.error('Failed to censor message:', error);
            }
        } else {
            // Proceed with adding XP if the message is not censored
            const xpToAdd = 10;
            addXP(message.author.id, xpToAdd)
                .then(() => {
                    console.log(`Added ${xpToAdd} XP to user ${message.author.id}`);
                })
                .catch(error => {
                    console.error('Failed to add XP:', error);
                });
        }
    },
};
