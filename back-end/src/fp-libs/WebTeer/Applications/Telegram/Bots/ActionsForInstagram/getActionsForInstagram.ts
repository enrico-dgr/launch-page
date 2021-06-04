import { pipe } from 'fp-ts/function';
import * as WT from 'WebTeer/index';

export interface ActionsForInstagramDeps {}

export const getActionsForInstagram: (
  D: ActionsForInstagramDeps
) => WT.WebProgram<void> = (D) => pipe(WT.of(undefined));
