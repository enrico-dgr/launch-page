import { get } from 'WebTeer/Bot/init';

import { checksAfterDo } from './checksAfterDo';
import { initDo } from './do';

const init = get<string, string>({
  do: initDo,
  checksAfterDo: checksAfterDo,
});
export { init };
