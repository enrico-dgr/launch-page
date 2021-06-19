// ↓-- bad result
pipe(
 matchOneSetOfProperties([[["innerText","some wrong text"]]]),
 WT.map(
// first set of props ----↓  ↓---- first prop
   wrongSets => wrongSets[0][0]
 ),
 WT.map(
   console.log
 ) // output -> ['innerText','some wrong text']
);
// ↓-- bad result
pipe(
 matchOneSetOfProperties([[['...','...'],["./someWrongRelativeXPath","Found"]]]),
 WT.map(
// first set of props ----↓  ↓---- second prop
   wrongSets => wrongSets[0][1]
 ),
 WT.map(
   console.log
 ) // output -> ["./someWrongRelativeXPath","Found"]
);
// ↓-- good result
pipe(
 matchOneSetOfProperties([[["innerText","some good text"]]]),
 WT.map(
   wrongSets => wrongSets
 ),
 WT.map(
   console.log
 ) // output -> [[]]
);
