import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

import { log } from '../src/utils';
import { socialgiftExec as socialgift } from './socialgift';

// -----------------------
// Socialgift
// -----------------------
pipe(socialgift.injecter, TE.chain(socialgift.runner), log)();
