const { addXP, CensoredWord } = require('../database/index');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignore messages from bots
        if (message.author.bot) return;

        // Fetch all censored words from the database
        const censoredWords = await CensoredWord.findAll();
        const foundWord = censoredWords.find(w => message.content.toLowerCase().includes(w.word.toLowerCase()));

        if (foundWord) {
            // Attempt to delete the original message
            try {
                await message.delete();
                const logChannel = message.guild.channels.cache.find(channel => channel.name === 'censor-log');
                if (logChannel) {
                    // Formatting the timestamp to HH:MM
                    const timeStamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

                    const censorMessage = `[${timeStamp}] Censored message by ${message.author.username} (${message.author.id}) in ${message.channel.name}, '${foundWord.word}' is not allowed.\n\n\`${message.content}\``;
                    await logChannel.send({ content: censorMessage });
                }
            } catch (error) {
                console.error('Failed to censor message:', error);
            }
        } else {
            // Generate a random amount of XP to add, between 1 and 10
            const xpToAdd = Math.floor(Math.random() * 10) + 1;
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
