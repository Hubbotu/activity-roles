import { db, GuildData } from './../db';
//mention that no roles are removed and maybe there is an extra command

import { Command } from '../commandHandler';
import Discord from 'discord.js';

import config from '../../../config';
import msg from '../messages';

export default {
  name: 'removeactivityrole',
  category: 'Configuration',
  description: 'Deletes an activity role from your guild.',
  requiredPermissions: ['MANAGE_ROLES'],

  testOnly: config.debug,
  guildOnly: true,

  options: [
    {
      name: 'role',
      description: 'the role I used to assign',
      required: true,
      type: 'ROLE'
    },
    {
      name: 'activity_name',
      description: 'The name of the discord presence I was looking for',
      required: true,
      type: 'STRING'
    }
  ],

  callback: async interaction => {
    await interaction.deferReply({ ephemeral: true });
    msg.log.command();

    const role = interaction.options.getRole('role')!;
    const activityName = interaction.options.getString('activity_name')!;

    const data: GuildData | null = db
      .prepare('SELECT * FROM guildData WHERE guildID = ? AND roleID = ?')
      .get(interaction.guild!.id);

    if (!data) {
      interaction.editReply({
        content: msg.activityRoleDoesNotExist()
      });
      return;
    }

    await interaction.editReply({
      embeds: [
        msg.removeActivityRoleQ(
          activityName,
          role.id,
          Boolean(data.exactActivityName),
          Boolean(data.live)
        )
      ],
      components: [msg.removeButtonRow()]
    });

    const filter = (btnInt: Discord.MessageComponentInteraction<'cached'>) => {
      return interaction.user.id === btnInt.user.id;
    };

    const collector = interaction.channel?.createMessageComponentCollector({
      filter,
      max: 1,
      time: 1000 * 60
    });

    collector?.on('collect', async (int: Discord.ButtonInteraction) => {
      switch (int.customId) {
        case 'remove':
          db.prepare('DELETE FROM guildData WHERE guildID = ? AND roleID = ?').run(
            interaction.guild!.id,
            role.id
          );
          int.update({ embeds: [msg.removed()], components: [] });
          break;
        case 'cancel':
          int.update({ embeds: [msg.cancelled()], components: [] });
          break;
      }
    });
  }
} as Command;
