import * as WT from '../../../../index';
import { get } from '../../../clean';

const clean = get({
  do: () => WT.of(undefined),
  checksAfterDo: () => [WT.of(undefined)],
});

export { clean };
