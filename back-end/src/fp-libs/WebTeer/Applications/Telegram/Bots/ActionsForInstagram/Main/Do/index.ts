import { doAction } from './doAction';
import { getDo } from './getDo';
import { ActionInfo, getInfos } from './getInfos';

const mainDo = getDo<ActionInfo>({
  getInfos: getInfos,
  doAction: doAction,
});
export { mainDo };
