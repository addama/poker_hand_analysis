function calculateOuts(a) {
	let a1 = [], s1 = [], outs = 0
	let p = a.potential, c = a.current
	
	let check = (n,t) => {
		let r = 0
		if (a1.indexOf(n) !== -1) {
			r -= t
		} else if (s1.indexOf(n) !== -1) {
			r -= 1
		}
		return r
	}

	if (a.hand > STRAIGHTFLUSH && p.straightflush.within1.length) {
		p.straightflush.within1.map(n => s1.push(...n[1]))
	}
	if (a.hand > FLUSH && p.flush.within1 !== !1) {
		s1.push(...invertSuit(c.suits[p.flush.within1]))
	}
	if (a.hand > STRAIGHT && p.straight.within1.length) {
		p.straight.within1.map(n => {if (!n[4]) a1.push(...n[1])})
	}
	a1 = arrayUnique(a1)
	s1 = arrayUnique(s1)

	if ((c.trey || c.fullhouse) && a.hand > QUAD) {
		// Trey to Quad, 1 card, 1 outs
		// Fullhouse to Quad, 1 card, 1 outs, same cards as trey
		let t = 1
		if (a1.indexOf(c.duplicates[0][0]) !== -1 || s1.indexOf(c.duplicates[0][0]) !== -1) {
			t = 0
		}
		outs += t
	}
	if (c.twopair && a.hand > FULLHOUSE) {
		// Two pair to Fullhouse, 2 cards, 4 outs, either of the pair cards
		// Two pair to Trey, 2 cards, 4 outs, either of the pair cards - same as those for Fullhouse
		let t = 4
		let d = [c.duplicates[0][0], c.duplicates[1][0]]
		for (let i = 0; i < d.length; i++) {
			t += check(d[i],2)
		}
		outs += t
	}
	if (c.trey && a.hand > FULLHOUSE) {
		// Trey to Fullhouse, 2 cards, 6 outs, either of the non-trey cards
		let d = a.cards.filter(n => n !== c.duplicates[0][0]).map(n => n[2])
		let t = 6
		for (let i = 0; i < d.length; i++) {
			t += check(d[i],3)
		}
		outs += t
	}
	if (c.pair && a.hand !== TWOPAIR && a.hand > TREY) {
		// Pair to Trey, 1 card, 2 outs
		let t = 2 + check(c.duplicates[0][0], 2)
		outs += t
	}
	if (a.hand === HIGHCARD) {
		// Highcard to Pair, 1 card, 3 outs, a duplicate of the highest card
		let t = 3 + check(c.highCard,3)
		outs += t
	}
	if (a1.length) {
		for (let i = 0; i < a1.length; i++) {
			outs += (s1.indexOf(a1[i]) == -1) ? 4 : 3
		}
	}
	outs += s1.length
	return outs
}

function analyze(c) {
	if (c.length < 2) return !1
	let analysis = {cards:!1,potential:!1,string:!1}
	
	let h = identifyHand(c)
	let str = toString(h)
	analysis.cards = h
	analysis.string = str
	
	if (h.length > 2) {
		let d = [], m = {}, quad = !1, trey = !1, pair = !1, straight = !0, flush = !0, hand = 9, ss = [[],[],[],[]], sm = [], sb = [], sfw = [[],[]], sw = [[],[]], fw = [!1,!1], phc = [0,0], ph = [9]
		let findbest = n => (n<hand||hand==-1)&&(hand=n)
		phc[0] = h[0][2]
		phc[1] = h[0][2]

		for (let i = 0; i < h.length; i++) {
			if (h[i][0] > 52) {
				console.error('Invalid card index')
				return !1
			}
			
			let r = h[i][2]
			
			m[r] = m[r] || 0
			m[r]++
				
			if (i > 0 && flush && h[0][1] !== h[i][1]) flush = !1
			ss[h[i][1]].push(r)
			
			if (i == 0) {
				if (r < 13) {
					sm.push(r+2,r+1)
					sb.push(-1,-1)
				} else {
					if (r == 13) sm.push(14),sb.push(-1)
				}
				sm.push(r)
				sb.push(h[i][1])
			} else {
				if (r !== h[i-1][2]) {
					if (h[i-1][2] - r == 1) {
						sm.push(r)
						sb.push(h[i][1])
					} else {
						if (straight) straight = !1
						let b = range(r+1, h[i-1][2]-1)
						sm.push(...b, r)
						sb.push(...Array(b.length).fill(-1), h[i][1])
					}
				} else {
					straight = !1
				}
			}
			if (i == h.length-1) {
				if (r > 3) {
					sm.push(r-1,r-2)
					sb.push(-1,-1)
				} else {
					if (r == 3) sm.push(2) && sb.push(-1)
				}
			}
		}

		for (let [ r1, c1 ] of Object.entries(m)) {
			(c1 > 1) && d.push([+r1, c1])
			if (c1 == 4) quad = !0, findbest(QUAD)
			if (c1 == 3) trey = !0, findbest(TREY)
			if (c1 == 2) pair = !0, findbest(PAIR)
		}
		d.sort((a, b) => b[1] - a[1])

		// [ evaluated group, missing cards, has higher high card, suit if flush potential or false, royal flush potential ]
		for (let i = 0; i < sm.length-4; i++) {
			let g1=sm.slice(i,i+5), g3=sb.slice(i,i+5), t=-1, outs=g3.join``.split(-1).length-1, f=g1.filter((n,i) => g3[i] === -1), sf=!1, p=(g1[0] > h[0][2])
			if (outs < 3 && outs !== 0) {
				// console.log(i, g1, g3, f, p, outs)
				if (ph.indexOf(STRAIGHT) == -1) ph.push(STRAIGHT)
				sf = g3.every(n => { if (t == -1 && n !== -1) t = n; return (n == -1 || n == t) })
				if (ph.indexOf(STRAIGHTFLUSH) == -1 && sf) ph.push(STRAIGHTFLUSH)
				let k = [g1,f,p,(sf)?t:!1,(g3 == 14)],w=outs-1
				sw[w].push(k)
				if (sf) sfw[w].push(k)
				if (g1[0] > h[0][2]) phc[w] = (g1[0] > phc[w]) ? g1[0] : phc[w]
			}
		}
		
		for (let i = 0; i < ss.length; i++) {
			if (ss[i].length == 4) fw[0] = i, ph.push(FLUSH)
			if (ss[i].length == 3) fw[1] = i, ph.push(FLUSH)
		}

		if (straight && flush && h[0][2] == 14) findbest(ROYALFLUSH)
		if (straight && flush && h[0][2] !== 14) findbest(STRAIGHTFLUSH)
		if (straight && !flush) findbest(STRAIGHT)
		if (flush && !straight) findbest(FLUSH)
		if (trey && pair) findbest(FULLHOUSE)
		if (d.length > 1 && !trey) findbest(TWOPAIR)
		
		analysis = Object.assign(analysis, {
			hand,
			current: {
				highCard: h[0][2],
				straight, 
				flush, 
				quad, 
				trey, 
				pair,
				fullhouse: (trey && pair),
				twopair: tp=(d.length > 1 && !trey),
				duplicates: d,
				suits: ss
			},
			potential: {
				hands: ph,
				straight: {
					highCard: {
						within1: phc[0],
						within2: phc[1]
					},
					within1: sw[0],
					within2: sw[1]
				},
				straightflush: {
					within1: sfw[0],
					within2: sfw[1]
				},
				flush: {
					within1: fw[0],
					within2: fw[1]
				},
				duplicates: {
					trey: {
						within1: (pair),
						within2: !0
					},
					quad: {
						within1: (trey),
						within2: (pair)
					},
					fullhouse: {
						within1: (tp),
						within2: (trey)
					}
				}
			}
		})
		let outs = calculateOuts(analysis)
		analysis.potential.outs = outs
	} else {
		analysis.potential = PREFLOPHANDS[str]
	}

	return analysis
}