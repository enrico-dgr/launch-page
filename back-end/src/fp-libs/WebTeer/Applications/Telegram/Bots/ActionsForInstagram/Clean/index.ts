import { get } from 'WebTeer/Bot/clean';
import * as WT from 'WebTeer/index';

const clean = get({
  do: () => WT.of(undefined),
  checksAfterDo: () => [WT.of(undefined)],
});

export { clean };
