import * as WT from '../../../../index';
import { get } from '../../../init';

const init = get({
  do: () => WT.of(undefined),
  checksAfterDo: () => [WT.of(undefined)],
});
export { init };
