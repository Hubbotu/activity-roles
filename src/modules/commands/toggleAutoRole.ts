import { checkUser, db, UserConfig } from './../db';
import { Command } from '../commandHandler';

import config from '../../../config';
import msg from '../messages';
export default {
  name: 'toggleautorole',
  category: 'User Configuration',
  description: 'Enables/Disables automatic role assignment',

  testOnly: config.debug,

  options: [
    {
      name: 'enabled',
      description: 'whether or not to enable the bot for this user',
      required: false,
      type: 'BOOLEAN'
    }
  ],

  callback: async interaction => {
    await interaction.deferReply();
    msg.log.command();

    const autoRole = interaction.options.getBoolean('enabled');
    const res: UserConfig | null = db
      .prepare('SELECT * FROM userConfig WHERE userId = ?')
      .get(interaction.user.id);
    if (!res) {
      await checkUser(interaction.user);
      await interaction.editReply({ embeds: [msg.errorEmbed()] });
      return;
    }
    if (autoRole === null) {
      interaction.editReply({ embeds: [msg.userStatus(Boolean(res.autoRole))] });
    } else {
      db.prepare('UPDATE userConfig SET autoRole = ? WHERE userId = ?').run(
        autoRole,
        interaction.user.id
      );
      interaction.editReply({ embeds: [msg.modifiedAutoRole(autoRole)] });
    }
  }
} as Command;
