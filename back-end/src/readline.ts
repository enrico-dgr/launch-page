import { createInterface } from 'readline';

import * as WP from './WebProgram';

export const askData: (query: string) => WP.WebProgram<string> = WP.fromTaskK(
  (nameOdData) => () =>
    new Promise((resolve) => {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(`${nameOdData}> `, (answer) => {
        rl.close();
        resolve(answer);
      });
    })
);
