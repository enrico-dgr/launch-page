import * as WT from '../../../../index';
import { get } from '../../../conclusion';

const conclusion = get({
  do: () => WT.of(undefined),
  checksAfterDo: () => [WT.of(undefined)],
});

export { conclusion };
