import { get, MainResult } from 'WebTeer/Bot/main';
import * as WT from 'WebTeer/index';

const main = get({
  checksBeforeDo: () => [WT.of(undefined)],
  do: () => WT.of<MainResult>({ end: true }),
  checksAfterDo: () => [WT.of(undefined)],
});

export { main };
