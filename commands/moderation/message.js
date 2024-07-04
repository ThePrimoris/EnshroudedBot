const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('message')
    .setDescription('Send a message to a specified channel')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to send the message to')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)) // Ensure only text channels are selectable
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to send')
        .setRequired(true)),
  requiredPermissions: ['ManageMessages'],
  category: 'utility',
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
    }

    const targetChannel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const user = interaction.user;
    const replyChannelId = '1047449388089356328';

    try {
      await targetChannel.send(message);

      // Fetch the specific channel where the reply should be sent
      const replyChannel = await interaction.client.channels.fetch(replyChannelId);
      if (replyChannel) {
        await replyChannel.send(`@${user.tag} sent \`${message}\` to ${targetChannel}`);
      } else {
        console.error('Reply channel not found.');
      }

      // Acknowledge the interaction
      await interaction.reply({ content: 'Message sent successfully.', ephemeral: true });
    } catch (error) {
      console.error('Error executing message command:', error);
      await interaction.reply({ content: 'Failed to send the message. Please make sure I have the right permissions and try again.', ephemeral: true });
    }
  },
};
