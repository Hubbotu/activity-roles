import config from '../config';
import db from './modules/db';
import { connect as discordJSConnect } from './modules/bot';

db.connect(config.MONGODB_URI);
discordJSConnect();
// require('./modules/db').connect();

export {}