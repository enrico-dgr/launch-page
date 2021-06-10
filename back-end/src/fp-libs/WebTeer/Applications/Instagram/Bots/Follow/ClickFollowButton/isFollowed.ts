import { pipe } from 'fp-ts/lib/function';
import { ElementHandle } from 'puppeteer';
import * as WT from 'WebTeer/index';
import { checkProperties } from 'WebTeer/Utils/ElementHandle';

import { ButtonProps } from './index';

export const isFollowed: (
  button: ElementHandle<HTMLButtonElement>,
  postClick: ButtonProps
) => WT.WebProgram<boolean> = (button, postClick) =>
  pipe(
    button,
    checkProperties(postClick),
    WT.chain((wrongProps) =>
      wrongProps.length > 0 ? WT.of(false) : WT.of(true)
    )
  );
