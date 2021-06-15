import { pipe } from 'fp-ts/function';
import * as WT from 'src/index';
import { MainResult } from 'src/WebTeer/Bot/main';

import { BotDeps } from '../..';

interface Deps<InfosAction> {
  readonly getInfos: (m: BotDeps) => WT.WebProgram<InfosAction>;
  readonly doAction: (ia: InfosAction) => WT.WebProgram<MainResult>;
}

export const getDo: <InfosAction>(
  D: Deps<InfosAction>
) => (m: BotDeps) => WT.WebProgram<BotDeps & MainResult> = (D) => (m) =>
  pipe(
    D.getInfos(m),
    WT.chain(D.doAction),
    WT.chain((mainResult) => WT.of({ ...mainResult, ...m }))
  );
