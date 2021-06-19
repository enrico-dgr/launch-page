/**
 * @since 1.0.0
 */
import * as C from 'fp-ts/lib/Console';
import { pipe } from 'fp-ts/lib/function';
import { chain, IO } from 'fp-ts/lib/IO';
import * as L from 'logging-ts/lib/Task';

type Level = "Debug" | "Info" | "Warning" | "Error";

interface Entry {
  message: string;
  time: Date;
  level: Level;
}
