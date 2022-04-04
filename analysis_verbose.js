/*
	A	2	3	4	5	6	7	8	9	10	J	Q	K
C	1	2	3	4	5	6	7	8	9	10	11	12	13
D	14	15	16	17	18	19	20	21	22	23	24	25	26
H	27	28	29	30	31	32	33	34	35	36	37	38	39
S	40	41	42	43	44	45	46	47	48	49	50	51	52
*/

function calculateOuts(analysis) {
	// Outs are any card still "out there" that could improve your hand is drawn
	// An unsuited out represents 4 possible cards, while a suited out represents 1 card - it's important to know 
	// where these intersect, because outs for one hand will overlap with outs from another, and outs are not counted twice
	// This function calculates all outs within 1 card, which seems to be standard practice, although
	// the analyze function will report on hand improvements within 2 cards as well
	let anySuit = []
	let suited = []
	let outs = 0
	let potential = analysis.potential
	let current = analysis.current
	
	const check = (rank, value) => {
		let diff = 0
		if (anySuit.indexOf(rank) !== -1) {
			diff -= value
		} else if (suited.indexOf(rank) !== -1) {
			diff -= 1
		}
		return diff
	}

	// This section builds the arrays of suited and unsuited outs already gathered by analysis
	// These will serve as the basis for checking the more fluid duplicates below
	if (analysis.hand > STRAIGHTFLUSH) {
		if (potential.straightflush.within1.length) {
			potential.straightflush.within1.map(n => suited.push(...n[1]))
		}
	}

	if (analysis.hand > FLUSH) {
		if (potential.flush.within1 !== false) {
			suited.push(...invertSuit(current.suits[potential.flush.within1]))
		}
	}

	if (analysis.hand > STRAIGHT) {
		if (potential.straight.within1.length) {
			potential.straight.within1.map(n => {if (!n[4]) anySuit.push(...n[1])})
		}
	}

	anySuit = arrayUnique(anySuit)
	suited = arrayUnique(suited)
	
	// For evaluating duplicates: Add the expected outs BUT only if the rank is not present in a1, AND subtract 1 if present in s1
	if (current.trey && analysis.hand > QUAD) {
		// Trey to Quad, 1 card, 1 outs
		let diff = 1

		if (anySuit.indexOf(current.duplicates[0][0]) !== -1 || suited.indexOf(current.duplicates[0][0]) !== -1) {
			diff = 0
		}

		outs += diff
	}

	if (current.twopair && analysis.hand > FULLHOUSE) {
		// Two pair to Fullhouse, 2 cards, 4 outs, either of the pair cards
		// Two pair to Trey, 2 cards, 4 outs, either of the pair cards - same as those for Fullhouse
		let diff = 4
		let duplicates = [current.duplicates[0][0], current.duplicates[1][0]]

		for (let i = 0; i < duplicates.length; i++) {
			diff += check(duplicates[i], 2)
		}

		outs += diff
	}

	if (current.trey && analysis.hand > FULLHOUSE) {
		// Trey to Fullhouse, 2 cards, 6 outs, either of the non-trey cards
		let duplicates = analysis.cards.filter(n => n !== current.duplicates[0][0]).map(n => n[2])
		let diff = 6

		for (let i = 0; i < duplicates.length; i++) {
			diff += check(duplicates[i],3)
		}

		outs += diff
	}

	if (current.pair && analysis.hand !== TWOPAIR && analysis.hand > TREY) {
		// Pair to Trey, 1 card, 2 outs
		let diff = 2 + check(current.duplicates[0][0], 2)
		outs += diff
	}

	if (analysis.hand === HIGHCARD) {
		// Highcard to Pair, 1 card, 3 outs, a duplicate of the highest card
		let diff = 3 + check(current.highCard, 3)
		outs += diff
	}

	// There are 4 of any card, so we multiply by this number to get the total number of outs
	// This is modified by the card being present in the suited array, which will take up 1 of the outs
	// These single cards are added afterward. This assures that all outs are counted, even if all outs are suited
	if (anySuit.length) {
		for (let i = 0; i < anySuit.length; i++) {
			outs += (suited.indexOf(anySuit[i]) == -1) ? 4 : 3
		}
	}

	outs += suited.length

	return outs
}

function analyze(cards) {
	if (cards.length < 2) {
		return false
	}

	// Common analysis observations regardless of hand size
	let analysis = {
		cards: false, 
		potential: false, 
		string: false
	}
	
	// The array of card indexes are converted to identities, sorted from highest to lowest, then converted to a string (e.g. AKo)
	let hand = identifyHand(cards)
	let string = toString(hand)
	analysis.cards = hand
	analysis.string = string
	
	// 5 and 6-card hands require different analysis than 2-card hands
	if (hand.length > 2) {
		let duplicates = []
		let multiples = {}
		let isQuad = false
		let isTrey = false
		let isPair = false
		let isStraight = true
		let isFlush = true
		let bestHand = HIGHCARD
		let suits = [[], [], [], []]
		let straightMatrix = []
		let suitBitmask = []
		let straightFlushWithin = [[], []]
		let straightWithin = [[], []]
		let flushWithin = [false, false]
		let potentialHighCardWithin = [0, 0]
		let potentialHand = [HIGHCARD]

		// Simple function for determining the highest value hand out of all potential hands
		const findbest = n => (n < bestHand || bestHand == -1) && (bestHand = n)

		potentialHighCardWithin[0] = hand[0][2]
		potentialHighCardWithin[1] = hand[0][2]
		
		// Master loop, trying to do as much as possible in one go
		for (let i = 0; i < hand.length; i++) {
			if (hand[i][0] > 52) {
				console.error('Invalid card index')
				return false
			}
			
			let rank = hand[i][2]
			
			// Find multiples, which will be used to find duplicates (i.e. pair, trey, twopair, quad) later
			multiples[rank] = multiples[rank] || 0
			multiples[rank]++
			
			// Iteratively find flush sequences. If we find a different suit, we know there's no flush here
			if (i > 0 && isFlush && hand[0][1] !== hand[i][1]) {
				isFlush = false
			}

			suits[hand[i][1]].push(rank)
			
			// Iteratively find straight sequences by building a straight matrix and a suit bitmask
			// The Straight Matrix is simply a continuum of all held cards with non-held connecting, starting, and ending cards
			// The Suit Bitmask (isn't technically a bitmask) tracks the suits (or -1) for the straight matrix, and serves 
			// as a way to know which cards are held and which are non-held
			// These arrays will be iterated over later to find straights and flushes

			if (i == 0) {
				// Add up to 2 non-held cards to the front of the continuum
				if (rank < 13) {
					straightMatrix.push(rank + 2, rank + 1)
					suitBitmask.push(-1, -1)
				} else {
					if (rank == 13) {
						straightMatrix.push(14)
						suitBitmask.push(-1)
					}
				}
				straightMatrix.push(rank)
				suitBitmask.push(hand[i][1])
			} else {
				if (rank !== hand[i - 1][2]) {
					if (hand[i - 1][2] - rank == 1) {
						straightMatrix.push(rank)
						suitBitmask.push(hand[i][1])
					} else {
						isStraight = false
						// Generate connecting non-held cards between non-sequential held cards
						let filler = range(rank + 1, hand[i - 1][2] - 1)
						straightMatrix.push(...filler, rank)
						suitBitmask.push(...Array(filler.length).fill(-1), hand[i][1])
					}
				} else {
					isStraight = false
				}
			}
			// Add up to 2 cards to the end of the continuum
			if (i == hand.length-1) {
				if (rank > 3) {
					straightMatrix.push(rank - 1, rank - 2)
					suitBitmask.push(-1, -1)
				} else {
					if (rank == 3) {
						straightMatrix.push(2)
						suitBitmask.push(-1)
					}
				}
			}
		}

		// Secondary loop through multiples to find duplicate hand-types
		// Duplicates are sorted by number of occurances
		for (let [ rank, count ] of Object.entries(multiples)) {
			(count > 1) && duplicates.push([+rank, count])
			if (count == 4) isQuad = true, findbest(QUAD)
			if (count == 3) isTrey = true, findbest(TREY)
			if (count == 2) isPair = true, findbest(PAIR)
		}
		duplicates.sort((a, b) => b[1] - a[1])

		// Secondary loop through straight matrix continuum
		// This is accomplished by slicing the arrays into a window of 5 cards, iteratively moving this window upward
		// The bitmasks are used to easily pull information from multiple dimensions without having to go back and look or recalculate
		for (let i = 0; i < straightMatrix.length - 4; i++) {
			// i is the starting position for a 5 index subsection
			let group1 = straightMatrix.slice(i, i + 5)
			let group2 = suitBitmask.slice(i, i + 5)
			let trump = -1
			let outs = group2.join('').split(-1).length - 1
			let filtered = group1.filter((n, i) => group2[i] === -1)
			let isStraightFlush = false
			let higherHighCard = (group1[0] > hand[0][2])
			
			if (outs < 3 && outs !== 0) {
				if (potentialHand.indexOf(STRAIGHT) == -1) {
					potentialHand.push(STRAIGHT)
				}
				
				isStraightFlush = group2.every(n => { 
					if (trump == -1 && n !== -1) {
						trump = n
						return (n == -1 || n == trump) 
					}
				})
				
				if (potentialHand.indexOf(STRAIGHTFLUSH) == -1 && isStraightFlush) {
					potentialHand.push(STRAIGHTFLUSH)
				}
				
				// [ evaluated group, missing cards, has higher high card, suit if flush potential or false, royal flush potential ]
				let within = outs - 1
				let straight = [
					group1, 
					filtered, 
					higherHighCard, 
					(isStraightFlush) ? trump : false, 
					(group2 == 14)
				]

				straightWithin[within].push(straight)
				if (isStraightFlush) {
					straightFlushWithin[within].push(straight)
				}

				if (group1[0] > hand[0][2]) {
					potentialHighCardWithin[within] = (group1[0] > potentialHighCardWithin[within]) ? group1[0] : potentialHighCardWithin[within]
				}
			}
		}
		
		// Secondary loop through suits for potential flushes within 1 and 2 cards
		for (let i = 0; i < suits.length; i++) {
			if (suits[i].length == 4) {
				flushWithin[0] = i
				potentialHand.push(FLUSH)
			}

			if (suits[i].length == 3) {
				flushWithin[1] = i
				potentialHand.push(FLUSH)
			}
		}
		
		// Determine most hand configurations based on previous analysis
		if (isStraight && isFlush && hand[0][2] == 14) findbest(ROYALFLUSH)
		if (isStraight && isFlush && hand[0][2] !== 14) findbest(STRAIGHTFLUSH)
		if (isStraight && !isFlush) findbest(STRAIGHT)
		if (isFlush && !isStraight) findbest(FLUSH)
		if (isTrey && isPair) findbest(FULLHOUSE)
		if (duplicates.length > 1 && !isTrey) findbest(TWOPAIR)
		
		// Build the analysis object
		analysis = Object.assign(analysis, {
			hand: bestHand,
			current: {
				highCard: hand[0][2],
				straight: isStraight, 
				flush: isFlush, 
				quad: isQuad, 
				trey: isTrey, 
				pair: isPair,
				fullhouse: (isTrey && isPair),
				twopair: tp = (duplicates.length > 1 && !isTrey),
				duplicates: duplicates,
				suits
			},
			potential: {
				hands: potentialHand,
				straight: {
					highCard: {
						within1: potentialHighCardWithin[0],
						within2: potentialHighCardWithin[1]
					},
					within1: straightWithin[0],
					within2: straightWithin[1]
				},
				straightflush: {
					within1: straightFlushWithin[0],
					within2: straightFlushWithin[1]
				},
				flush: {
					within1: flushWithin[0],
					within2: flushWithin[1]
				},
				duplicates: {
					trey: {
						within1: (isPair),
						within2: true
					},
					quad: {
						within1: (isTrey),
						within2: (isPair)
					},
					fullhouse: {
						within1: (tp),
						within2: (isTrey)
					}
				}
			}
		})

		// Calculating outs is a lot of specialized code, so it's put in an external function
		let outs = calculateOuts(analysis)
		analysis.potential.outs = outs
	} else {
		// 2-card hands require different analysis, which has already been calculated and compiled into 
		// a mega-object representing all formulas and tables, as opposed to calling all those functions
		// individually - the functions still remain, however
		analysis.potential = PREFLOPHANDS[string]
	}

	return analysis
}