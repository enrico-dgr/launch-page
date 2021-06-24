import { createInterface } from 'readline';

import * as WT from './WebProgram';

export const askData: (
  nameOdData: string
) => WT.WebProgram<string> = WT.fromTaskK((nameOdData) => () =>
  new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(`Type ${nameOdData.toLowerCase()}> `, (answer) => {
      rl.close();
      resolve(answer);
    });
  })
);
