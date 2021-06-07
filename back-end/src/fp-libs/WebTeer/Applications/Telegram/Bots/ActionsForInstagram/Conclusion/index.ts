import { get } from 'WebTeer/Bot/conclusion';
import * as WT from 'WebTeer/index';

const conclusion = get({
  do: () => WT.of(undefined),
  checksAfterDo: () => [WT.of(undefined)],
});

export { conclusion };
