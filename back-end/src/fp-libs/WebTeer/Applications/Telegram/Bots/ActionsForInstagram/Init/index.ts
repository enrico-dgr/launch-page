import { get } from 'WebTeer/Bot/init';

import { BotDeps } from '../index';
import { checksAfterDo } from './checksAfterDo';
import { initDo } from './do';

const init = get<BotDeps, BotDeps>({
  do: initDo,
  checksAfterDo: checksAfterDo,
});
export { init };
