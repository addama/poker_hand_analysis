/*
Test distribution of Sklansky Chubukov points
let g1 = 0, g2 = 0, t = 0
for (let s in SKLANSKY[1]) {
	let n = SKLANSKY[1][s]
	t++
	if (n <= 30) {
		g1++
	} else {
		g2++
	}
}
console.log(`Less than 30: ${g1}\r\nGreater than 30: ${g2}\r\nTotal: ${t}`)
*/

/* 
// let cards = [2,15,28,6,19] // fullhouse
// let cards = [2,3,4,5,6] // straightflush
// let cards = [1,13,12,11,10] // royalflush
// let cards = [2,15,28,41,3] // quad
// let cards = [2,15,28,3,5] // trey
// let cards = [2,15,3,5,7] // pair
// let cards = [2,15,3,16,7] // twopair
// let cards = [14,13,12,11,10] // straight
// let cards = [14,12,10,8,6] // highcard
*/
const timeLimit = 1
const runCount = 1000000
const testHands = [
	{ hand: [1,13,12,11,10], result: ROYALFLUSH, string: 'AKQJTo', outs: 0 }, // royalflush
	{ hand: [2,3,4,5,6], result: STRAIGHTFLUSH, string: '65432o', outs: 0 }, // straightflush
	{ hand: [13,12,11,10,9], result: STRAIGHTFLUSH, string: 'KQJT9o', outs: 0 }, // straightflush
	{ hand: [2,15,28,41,3], result: QUAD, string: '32222o', outs: 0 }, // quad
	{ hand: [2,15,28,6,19], result: FULLHOUSE, string: '66222o', outs: 1 }, // fullhouse
	{ hand: [2,4,6,8,10], result: FLUSH, string: 'T8642o', outs: 0 }, // fullhouse
	{ hand: [14,13,12,11,10], result: STRAIGHT, string: 'AKQJTo', outs: 9 }, // straight
	{ hand: [2,15,28,3,5], result: TREY, string: '53222o', outs: 7 }, // trey
	{ hand: [2,15,3,16,7], result: TWOPAIR, string: '73322o', outs: 4 }, // twopair
	{ hand: [2,15,3,5,7], result: PAIR, string: '75322o', outs: 11 }, // pair
	{ hand: [14,12,10,8,6], result: HIGHCARD, string: 'AQT86o', outs: 11 }, // highcard
	{ hand: [14,29,10,52,6], result: HIGHCARD, string: 'AKT63o', outs: 3 } // highcard
]

function runTests(doTiming=true) {
	// Individual hand tests
	for (let i = 0; i < testHands.length; i++) {
		let hand = testHands[i].hand
		let t0 = performance.now()
		let analysis = analyze(hand)
		let t1 = performance.now()
		let identity = identifyHand(hand)

		console.log(`Test for ${hand}`,analysis)

		console.assert((t1 - t0) <= 1.0, `\tAnalysis took more than ${timeLimit}ms`, t1 - t0)
		console.assert(JSON.stringify(analysis.cards) == JSON.stringify(identity), '\tCalculated hand identity not the same as given hand identity', analysis.cards, identity)
		console.assert(analysis.string == testHands[i].string, '\tCalculated string not the same as given string', analysis.string, testHands[i].string)

		if (hand.length >= 5) {
			console.assert(analysis.hand == testHands[i].result, '\tHand solution not the same as given hand solution', analysis.hand, testHands[i].result)

			// Potential
			console.assert(analysis.potential.outs == testHands[i].outs,`Calculated outs not the same as given outs`,analysis.potential.outs, testHands[i].outs)
		}

		if (testHands[i].hand.length == 2) {

		}
	}

	if (doTiming) {
		// 1 million iterations timing test
		console.log(`${runCount} randomized iterations timing test running...`)
		let runs = [], min = 1.0, max = 0.0
		let t2 = performance.now()
		for (let i = 0; i <= runCount; i++) {
			let t0 = performance.now()
			analyze(deal(5))
			let t1 = performance.now()
			let d = t1-t0
			runs.push(d)
			if (d < min) min = d
			if (d > max) max = d
		}
		let t3 = performance.now()
		let avg = runs.reduce((a,b) => a+b) / runCount
		console.log(`\tAverage ms for ${runCount} runs: ${avg}; Min: ${min}; Max: ${max}; Total ms: ${t3-t2}`)
		console.assert(avg <= timeLimit / 2, `\tAverage execution time over ${runCount} runs is higher than ${timeLimit / 2}ms`, avg)
	}
	console.log('All tests complete!')
}