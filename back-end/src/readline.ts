import { createInterface } from 'readline';

import * as WP from './WebProgram';

export const askData: (
  nameOdData: string
) => WP.WebProgram<string> = WP.fromTaskK((nameOdData) => () =>
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
