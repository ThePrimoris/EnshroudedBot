const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('class_role')
        .setDescription('Send a message with buttons to select your class and receive the corresponding role.'),
        requiredPermissions: ['Administrator'],
    category: 'moderation',
    async execute(interaction) {
        // Check if the user has the ADMINISTRATOR permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: 'You need to be an administrator to use this command.', ephemeral: true });
        }

        const classes = [
            'Survivor', 'Beastmaster', 'Ranger', 'Assassin', 'Battlemage',
            'Healer', 'Wizard', 'Trickster', 'Athlete', 'Barbarian',
            'Warrior', 'Tank'
        ];

        const classEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Class Selection')
            .setDescription('Choose your class by clicking on the buttons below:');

        const rows = classes.reduce((acc, className, index) => {
            if (index % 5 === 0) acc.push(new ActionRowBuilder()); // New row every 5 buttons
            const button = new ButtonBuilder()
                .setCustomId(`class_role_${className.toLowerCase().replaceAll(' ', '_')}`)
                .setLabel(className)
                .setStyle(ButtonStyle.Primary);
            
            acc[acc.length - 1].addComponents(button);
            return acc;
        }, []);

        await interaction.reply({ embeds: [classEmbed], components: rows });
    },
};
