const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('message')
    .setDescription('Send a message to a specified channel or DM a user')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to send the message to')
        .addChannelTypes(ChannelType.GuildText)) // Ensure only text channels are selectable
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to DM (leave empty to send to a channel)'))
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
    const targetUser = interaction.options.getUser('user');
    const message = interaction.options.getString('message');
    const user = interaction.user;
    const replyChannelId = '1226803373328695306';

    try {
      if (targetUser) {
        // DM the specified user
        await targetUser.send(message);
        await interaction.reply({ content: `DM sent to ${targetUser.tag} successfully.`, ephemeral: true });
      } else if (targetChannel) {
        // Send message to the specified channel
        await targetChannel.send(message);

        // Fetch the specific channel where the reply should be sent
        const replyChannel = await interaction.client.channels.fetch(replyChannelId);
        if (replyChannel) {
          await replyChannel.send(`<@${user.id}> sent \`${message}\` to ${targetChannel}`);
        } else {
          console.error('Reply channel not found.');
        }

        await interaction.reply({ content: 'Message sent successfully to the channel.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'You must specify either a channel or a user to message.', ephemeral: true });
      }
    } catch (error) {
      console.error('Error executing message command:', error);
      await interaction.reply({ content: 'Failed to send the message. Please make sure I have the right permissions and try again.', ephemeral: true });
    }
  },
};
