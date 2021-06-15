import * as L from "logging-ts/lib/Task";
import * as C from "fp-ts/lib/Console";
import { chain, IO } from "fp-ts/lib/IO";
import { pipe } from "fp-ts/lib/function";

type Level = "Debug" | "Info" | "Warning" | "Error";

interface Entry {
  message: string;
  time: Date;
  level: Level;
}
