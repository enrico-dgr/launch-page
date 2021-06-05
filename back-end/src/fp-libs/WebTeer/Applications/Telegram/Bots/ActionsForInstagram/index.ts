import * as Bot from 'WebTeer/Bot';

import { clean } from './Clean';
import { init } from './Init';
import { main } from './Main';

const ActionsForInstagram = Bot.get({
  init,
  main,
  clean,
});
export { ActionsForInstagram };
