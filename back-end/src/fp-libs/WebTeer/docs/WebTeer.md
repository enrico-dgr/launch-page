<span style="color:red">Warning</span>
Before reading, be aware that knowing at least fp-ts library is needed to understand the docs.


------

# Making use of dependencies injection
The general WebTeer scheme is as follow:

![[WebTeer_v1.png]]

Every program runs under the dependency
```ts
import { Page } from "puppeteer";
export interface WebDeps {
	page: Page;
	// ...other
}
```
So every program is of type
```ts
import * as RTE from "fp-ts/ReaderTaskEither";

export interface WebProgram<A> 
	extends RTE.ReaderTaskEither<WebDeps, Error, A> {}
```
Though before implementation you'll have:
```ts
export const programToImplement = (D: Deps) => WebProgram<A>
```
If something needs variable or may need, instead of adding it in deps, the in-project choice is to implement the program at need:
```ts
export const program = (b: B): WebProgram<A> =>
	programToImplement({
			depWithVar: depWithVar(b),
			...deps
		}: Deps)
```
This way dependencies are more generic and synthetic. You can *pipe* programs. Or call them directly like: 
```ts
import P from "puppeteer";

const runProgram = program(b);
(async()=>{
	const browser = await P.launch({
		//settings
	});
	const page = await browser.newPage();
	
	await runProgram({
		page
		// ...other
	})() // running the task
	// equals to
	const runProgramSecond = pipe(
			{page},
			runProgram
		);
	await runProgramSecond();
})()
```
Directly do something with result, e.g. :
```ts
import { chain } from "library-with-chain";
//...
(async()=>{
	//...
	await pipe(
		{page},
		runProgram,
		chain(result =>
			doSomething(result)
			// could be a 
			// log(JSON.stringify(result))
		)
	)()
	// equals to
	const runProgramThird = pipe(
			{page},
			runProgram,
			chain(result =>
				doSomething(result)
				// could be a 
				// log(JSON.stringify(result))
			)
		);
	await runProgramThird();
})()
```

# Build on
[[Applications]]