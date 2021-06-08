import { get } from 'WebTeer/Bot';

import {} from './conclusion';
import {} from './init';
import {} from './main';

//`//section/div//button[contains(.,'Visualizza la storia')]`
interface InitType {}
interface MiddleType {}
interface ConclusionType {}

const openedByUrl = get<InitType, MiddleType, ConclusionType, ConclusionType>(
  {}
);
