import { log } from 'fp-ts/Console';
import { pipe } from 'fp-ts/lib/function';
import { chain, fromIO, Task } from 'fp-ts/Task';
import { createInterface } from 'readline';

const getLine: Task<string> = () =>
  new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("> ", (answer) => {
      rl.close();
      resolve(answer);
    });
  });

const putStrLn = (message: string): Task<void> => fromIO(log(message));
pipe(getLine, chain(putStrLn))();
