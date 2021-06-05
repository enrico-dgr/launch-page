import * as Bot from '../../bot';
import { clean } from './Clean';
import { init } from './Init';
import { main } from './Main';

const random_Bot_Name = Bot.get({
  init,
  main,
  clean,
});
export { random_Bot_Name };
