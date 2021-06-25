import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import path from 'path';

import { createErrorFromErrorInfos } from '../src/ErrorInfos';
import * as J from '../src/Json';
import * as JF from '../src/jsonFiles';
import { LaunchOptions, launchPage } from '../src/Puppeteer';
import { startFrom } from '../src/utils';
import * as WP from '../src/WebProgram';

const PATH = path.resolve(__filename);
const INJS = path.resolve(__dirname, "./deps.json");
// --------------------------------------
// Models
// --------------------------------------
/**
 *
 */
export type Deps<R extends J.Json> = J.Json & {
  nameOfProgram: string;
  r: R;
  launchOptions?: LaunchOptions;
};

/**
 *
 */
type Injecter<R extends J.Json> = TE.TaskEither<Error, Deps<R>>;
type Modifier<R extends J.Json> = (D: Deps<R>) => TE.TaskEither<Error, void>;
type Runner<R extends J.Json, A> = (D: Deps<R>) => TE.TaskEither<Error, A>;
/**
 *
 */
type Executable<R extends J.Json, A> = {
  injecter: Injecter<R>;
  modifier: Modifier<R>;
  runner: Runner<R, A>;
};
// --------------------------------------
// DB
// --------------------------------------
/**
 *
 */
type DBGet = <R extends J.Json, A>(
  f: (i: R) => WP.WebProgram<A>
) => (db: Deps<R>[]) => O.Option<Deps<R>>;
/**
 *
 */
const getDepsFromDB: DBGet = (f) => (db) =>
  pipe(
    db,
    A.findFirst((D) => D.nameOfProgram === f.name)
  );
/**
 *
 */
type DBSet = <R extends J.Json, A>(
  f: (i: R) => WP.WebProgram<A>,
  db: Deps<R>[],
  writer: (db: Deps<R>[]) => TE.TaskEither<Error, void>
) => (deps: Deps<R>) => TE.TaskEither<Error, void>;
/**
 *
 */
const setDepsOnDB: DBSet = (f, db, writer) => (deps) =>
  pipe(
    db,
    A.findIndex((D) => D.nameOfProgram === f.name),
    O.match(
      () => writer([...db, deps]),
      (index) => writer([...db.slice(0, index), deps, ...db.slice(index + 1)])
    )
  );
// --------------------------------------
// Json file
// --------------------------------------
/**
 *
 */
const getJson = <R extends J.Json>() =>
  pipe(
    JF.getFromJsonFile<Deps<R>[]>(INJS),
    E.chain((d) =>
      Array.isArray(d)
        ? E.right(d)
        : E.left(
            createErrorFromErrorInfos({
              message: "DB is an object, should be an array.",
              nameOfFunction: getJson.name,
              filePath: PATH,
            })
          )
    )
  );
/**
 *
 */
const setJson = <R extends J.Json>() => JF.postToJsonFile<Deps<R>[]>(INJS);
/**
 *
 */
const modifyDepsOnJsonFile = <R extends J.Json, A>(
  f: (i: R) => WP.WebProgram<A>
) => (D: Deps<R>) =>
  pipe(
    TE.fromEither(getJson<R>()),
    TE.chain((db) =>
      setDepsOnDB(f, db, (db: Deps<R>[]) => TE.fromEither(setJson()(db)))(D)
    )
  );
/**
 *
 */
const injectionFromJsonFile = <R extends J.Json, A>(
  f: (i: R) => WP.WebProgram<A>
) => (DefaultDeps: Deps<R>) =>
  pipe(
    TE.fromEither(getJson<R>()),
    TE.map(getDepsFromDB(f)),
    TE.chain(
      O.match(
        () =>
          pipe(
            DefaultDeps,
            modifyDepsOnJsonFile(f),
            TE.map(() => DefaultDeps)
          ),
        TE.of
      )
    )
  );
/**
 *
 */
const runnerOfJsonExecutable = <R extends J.Json, A>(
  f: (i: R) => WP.WebProgram<A>
) => (D: Deps<R>) => startFrom(f(D.r))(launchPage(D.launchOptions));
/**
 *
 */
export const jsonExecutable = <R extends J.Json, A>(
  f: (i: R) => WP.WebProgram<A>
) => (DefaultDeps: Deps<R>): Executable<R, A> => ({
  injecter: injectionFromJsonFile(f)(DefaultDeps),
  modifier: modifyDepsOnJsonFile(f),
  runner: runnerOfJsonExecutable(f),
});
