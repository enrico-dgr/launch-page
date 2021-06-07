import * as Bot from '../../bot';
import { conclusion } from './Clean';
import { init } from './Init';
import { main } from './Main';

const random_Bot_Name = Bot.get({
  init,
  main,
  conclusion: conclusion,
});
export { random_Bot_Name };
