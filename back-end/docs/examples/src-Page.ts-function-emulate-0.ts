// You can simply emulate a device as
// it happens for puppeteer.
import { pipe } from 'fp-ts/lib/function';
import { emulate } from '../../src/Page';
import * as WP from '../../src/WebProgram';
import * as WD from '../../src/WebDeps';
import { devices, launch } from "puppeteer";

const iPhone = devices["iPhone 6"];

(async ()=>{
 // ... launching puppeteer and deps
 const browser = await launch();
 const page = await browser.newPage();
 //
 await pipe(
   WP.ask(),
   WP.chain(r =>
     emulate(iPhone)(r.page)
   )
   // then change page or reload to see the effects
 )({ page } as WD.WebDeps)()
})()
