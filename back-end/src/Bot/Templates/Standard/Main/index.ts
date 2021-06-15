import * as WT from '../../../../index';
import { get } from '../../../main';

const main = get({
  checksBeforeDo: () => [WT.of(undefined)],
  do: () => WT.of({ end: false }),
  checksAfterDo: () => [WT.of(undefined)],
});

export { main };
