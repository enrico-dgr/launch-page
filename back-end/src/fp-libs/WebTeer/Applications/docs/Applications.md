# Build on
Suppose you're building a Facebook WebTeer, the generic pattern should be this:

![[WebTeerApplications.png]]

Directories structure:
- Facebook
	- index.ts
	- LikeToPost
		- index.ts

Code example:
```ts
// WebTeer/Applications/Facebook/LikeToPost/index.ts
// ...imports
import { WebProgram } from "../../../index";
interface Deps {
	// ...deps
}
export declare const likeToPost = <A>(d: Deps) => WebProgram<A>
```
```ts
// WebTeer/Applications/Facebook/index.ts
// ...imports
import * as LikeToPost from "./LikeToPost/index";

export const likeToPost = LikeToPost.likeToPost({
	// ...deps
}: Deps)
// OR
export const likeToPostSecond = (b: B) => LikeToPost.likeToPost({
	depWithVar: depWithVar(b)
	// ...deps
}: Deps)
```
**Note**:
I could import some dependency, e.g. utils or external libraries functions.
This way implementations would be synthetic too.
Especially with puppeteer (so in Webteer), you start from the basic functions and combine them into structuring files as **LikeToPost/index.ts**.

![[Generic Implementation.png]]