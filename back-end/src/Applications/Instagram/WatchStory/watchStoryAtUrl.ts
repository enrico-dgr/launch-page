import { pipe } from 'fp-ts/lib/function';
import { $x, waitFor$x } from 'src/dependencies';
import { click, expectedLength } from 'src/elementHandle';
import * as WT from 'src/index';

interface Settings {
  xpathOfButtonPermission: string;
  xpathOfButtonNext: string;
}
interface InputOfBody {
  settings: Settings;
}

const bodyOfWatchStoryAtUrl = (I: InputOfBody) => {
  const showStories = (
    delay: number,
    attempts: number
  ): WT.WebProgram<boolean> =>
    attempts > 0
      ? pipe(
          $x(I.settings.xpathOfButtonPermission),
          WT.chain(
            expectedLength((n) => n === 1)(
              (els, r) => `${els.length} permission-button to story`
            )
          ),
          WT.map((els) => els[0]),
          WT.chain(click),
          WT.map(() => true),
          WT.orElse(() =>
            pipe(
              undefined,
              WT.delay(delay),
              WT.chain(() => showStories(delay, attempts - 1))
            )
          )
        )
      : WT.of(false);

  const checkIfButtonIsGone = () =>
    pipe(
      $x(I.settings.xpathOfButtonPermission),
      WT.chain(
        expectedLength((n) => n === 0)(
          (els, r) => `${els.length} permission-button to story`
        )
      ),
      WT.map(() => true),
      WT.orElse(() => WT.of<boolean>(false))
    );
  return pipe(
    showStories(500, 10),
    WT.chain((b) => (b ? checkIfButtonIsGone() : WT.of(b))),
    WT.chain((b) =>
      b
        ? pipe(
            $x(I.settings.xpathOfButtonNext),
            WT.chain(
              expectedLength((n) => n === 1)(
                (els, r) => `${els.length} scrollRight-button in story`
              )
            ),
            WT.chain((btn) =>
              WT.of<TransitionType>({
                _tag: "Shown",
                buttonNext: btn,
                maxStories: i.maxStories,
              })
            )
          )
        : WT.of<TransitionType>({ _tag: "NotShown", maxStories: i.maxStories })
    )
  );
};
