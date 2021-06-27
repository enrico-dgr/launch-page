import * as WP from '../../src/WebProgram';
import * as WD from '../../src/WebDeps';
import { matchOneSetOfHTMLProperties } from '../../src/ElementHandle';
import { pipe } from 'fp-ts/lib/function';
// ↓-- bad result
pipe(
 WD.$x("//xpath"),
 WP.chain((els) =>
   matchOneSetOfHTMLProperties<HTMLElement, string>([
     [["innerText", "some wrong text"]],
   ])(els[0])
 ),
 WP.map(
   // first set of props ----↓  ↓---- first prop
   (wrongSets) => wrongSets[0][0]
 ),
 WP.map(console.log) // output -> ['innerText','some wrong text']
);
// ↓-- bad result
pipe(
 WD.$x("//xpath"),
 WP.chain((els) =>
   matchOneSetOfHTMLProperties<HTMLElement, string>([
     [
       ["innerHTML", "..."],
       [{ xpath: "./someWrongRelativeXPath" }, "Found"],
     ],
   ])(els[0])
 ),
 WP.map(
   // first set of props ----↓  ↓---- second prop
   (wrongSets) => wrongSets[0][1]
 ),
 WP.map(console.log) // output -> ["./someWrongRelativeXPath","Found"]
);
// ↓-- good result
pipe(
 WD.$x("//xpath"),
 WP.chain((els) =>
   matchOneSetOfHTMLProperties<HTMLElement, string>([
     [["innerText", "some good text"]],
   ])(els[0])
 ),
 WP.map((wrongSets) => wrongSets),
 WP.map(console.log) // output -> [[]]
);
