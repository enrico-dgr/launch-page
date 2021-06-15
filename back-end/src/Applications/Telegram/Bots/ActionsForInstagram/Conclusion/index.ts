import * as WT from 'src/index';
import { get } from 'src/WebTeer/Bot/conclusion';

const conclusion = get({
  do: () => WT.of(undefined),
  checksAfterDo: () => [WT.of(undefined)],
});

export { conclusion };
