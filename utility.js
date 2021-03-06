/*
	A	2	3	4	5	6	7	8	9	10	J	Q	K
C	1	2	3	4	5	6	7	8	9	10	11	12	13
D	14	15	16	17	18	19	20	21	22	23	24	25	26
H	27	28	29	30	31	32	33	34	35	36	37	38	39
S	40	41	42	43	44	45	46	47	48	49	50	51	52
*/

// Constants
const colors = [ 'black', 'red' ]
const suits = [ 'clubs', 'diamonds', 'hearts', 'spades' ]
const faces = [ 'jack', 'queen', 'king', 'ace' ]
const hands = [ 'royal flush', 'straight flush', 'four of a kind', 'full house', 'flush', 'straight', 'three of a kind', 'two pairs', 'pair', 'high card' ]
const ROYALFLUSH = 0, STRAIGHTFLUSH = 1, QUAD = 2, FULLHOUSE = 3, FLUSH = 4, STRAIGHT = 5, TREY = 6, TWOPAIR = 7, PAIR = 8, HIGHCARD = 9
const CARDSTRINGS = [ , , '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A' ]

// Data tables
const SKLANSKY = [
	[
		// Sklansky & Malmuth Starting Hands Table
		// Relative power groupings of all starting hands
		[ 'AAo', 'AKs', 'KKo', 'QQo', 'JJo' ],
		[ 'AKo', 'AQs', 'AJs', 'KQs', 'TTo' ],
		[ 'AQo', 'ATs', 'KJs', 'QJs', 'JTs', '99o' ],
		[ 'AJo', 'KQo', 'KTs', 'QTs', 'J9s', 'T9s', '98s', '88o' ],
		[ 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KJo', 'QJo', 'JTo', 'Q9s', 'T8s', '97s', '87s', '77o', '76o', '66o' ],
		[ 'ATo', 'KTo', 'QTo', 'J8s', '86s', '75s', '65s', '55o', '54s' ],
		[ 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s', 'J9o', 'T9o', '98o', '64s', '53s', '44o', '43s', '33o', '22o' ],
		[ 'A9o', 'K9o', 'Q9o', 'J8o', 'J7s', 'T8o', '96s', '87o', '85s', '76o', '74s', '65o', '54o', '42s', '32s' ]
	],
	{
		// Sklansky & Chubukov Starting Hands Ranking Table
		// Gives maximum effective stack that a small blind can likely profitably go all-in
		'AAo': 999,	'AKs': 277,	'AQs': 137,	'AJs': 92,	'ATs': 70,	'A9s': 52,	'A8s': 45,	'A7s': 40,	'A6s': 35,	'A5s': 36,	'A4s': 33,	'A3s': 31,	'A2s': 29,
		'AKo': 166,	'KKo': 477,	'KQs': 43,	'KJs': 36,	'KTs': 31,	'K9s': 24,	'K8s': 20,	'K7s': 19,	'K6s': 17,	'K5s': 16,	'K4s': 15,	'K3s': 14,	'K2s': 13,
		'AQo': 96,	'KQo': 29,	'QQo': 239,	'QJs': 25,	'QTs': 22,	'Q9s': 16,	'Q8s': 13,	'Q7s': 11,	'Q6s': 11,	'Q5s': 10,	'Q4s': 9.5,	'Q3s': 8.9,	'Q2s': 8.3,
		'AJo': 68,	'KJo': 25,	'QJo': 16,	'JJo': 160,	'JTs': 18,	'J9s': 13,	'J8s': 10,	'J7s': 8.6,	'J6s': 7.4,	'J5s': 7,	'J4s': 6.5,	'J3s': 6,	'J2s': 5.6, 
		'ATo': 53,	'KTo': 23,	'QTo': 15,	'JTo': 12,	'TTo': 120,	'T9s': 11,	'T8s': 8.7,	'T7s': 7.1,	'T6s': 6,	'T5s': 5,	'T4s': 4.6,	'T3s': 4.2,	'T2s': 3.8, 
		'A9o': 41,	'K9o': 18,	'Q9o': 12,	'J9o': 8.9,	'T9o': 7.4,	'99o': 96,	'98s': 7.6,	'97s': 6.1,	'96s': 5,	'95s': 4.1,	'94s': 3.3,	'93s': 3,	'92s': 2.7, 
		'A8o': 36,	'K8o': 15,	'Q8o': 9.9,	'J8o': 7.4,	'T8o': 6.1,	'98o': 5.1,	'88o': 80,	'87s': 5.6,	'86s': 4.5,	'85s': 3.6,	'84s': 2.8,	'83s': 2.2,	'82s': 2.1, 
		'A7o': 31,	'K7o': 14,	'Q7o': 8.5,	'J7o': 6.3,	'T7o': 5.1,	'97o': 4.3,	'87o': 5.6,	'77o': 67,	'76s': 4.2,	'75s': 3.3,	'74s': 2.6,	'73s': 2,	'72s': 1.6, 
		'A6o': 28,	'K6o': 13,	'Q6o': 8.1,	'J6o': 5.4,	'T6o': 4.3,	'96o': 3.5,	'86o': 3,	'76o': 2.7,	'66o': 58,	'65s': 3.1,	'64s': 2.4,	'63s': 1.9,	'62s': 1.5, 
		'A5o': 28,	'K5o': 12,	'Q5o': 7.5,	'J5o': 5,	'T5o': 3.5,	'95o': 2.8,	'85o': 2.4,	'75o': 2.1,	'65o': 2,	'55o': 49,	'54s': 2.4,	'53s': 1.9,	'52s': 1.6, 
		'A4o': 26,	'K4o': 11,	'Q4o': 6.8,	'J4o': 4.5,	'T4o': 3.1,	'94o': 2.2,	'84o': 1.9,	'74o': 1.7,	'64o': 1.6,	'54o': 1.6,	'44o': 41,	'43s': 1.7,	'42s': 1.4, 
		'A3o': 24,	'K3o': 11,	'Q3o': 6.3,	'J3o': 4,	'T3o': 2.7,	'93o': 2,	'83o': 1.5,	'73o': 1.4,	'63o': 1.3,	'53o': 1.3,	'43o': 1.2,	'33o': 33,	'32s': 1.3, 
		'A2o': 23,	'K2o': 10,	'Q2o': 5.7,	'J2o': 3.4,	'T2o': 2.4,	'92o': 1.8,	'82o': 1.4,	'72o': 1.1,	'62o': 1.1,	'52o': 1.1,	'42o': 1,	'32o': 0.9,	'22o': 24
	}
]
const STATS = [
	[
		// 169 possible starting hands, ranked by win percentage against 9 people, across 10000 games
		// https://caniwin.com/texasholdem/preflop/heads-up.php
		// Smaller is better
		'AAo','KKo','QQo','AKs','JJo',	'AQs','KQs','AJs','KJs','TTo',
		'AKo','ATs','QJs','KTs','QTs',	'JTs','99o','AQo','A9s','KQo',
		'88o','K9s','T9s','A8s','Q9s',	'J9s','AJo','A5s','77o','A7s',
		'KJo','A4s','A3s','A6s','QJo',	'66o','K8s','T8s','A2s','98s',
		'J8s','ATo','Q8s','K7s','KTo',	'55o','JTo','87s','QTo','44o',
		'33o','22o','K6s','97s','K5s',	'76s','T7s','K4s','K3s','K2s',
		'Q7s','86s','65s','J7s','54s',	'Q6s','75s','96s','Q5s','64s',
		'Q4s','Q3s','T9o','T6s','Q2s',	'A9o','53s','85s','J6s','J9o',
		'K9o','J5s','Q9o','43s','74S',	'J4s','J3s','95s','J2s','63s',
		'A8o','52s','T5s','84s','T4s',	'T3s','42s','T2s','98o','T8o',
		'A5o','A7o','73s','A4o','32s',	'94s','93s','J8o','A3o','62s',
		'92s','K8o','A6o','87o','Q8o',	'83s','A2o','82s','97o','72s',
		'75o','K7o','65o','T7o','K6o',	'86o','54o','K5o','J7o','75o',
		'Q7o','K4o','K3o','96o','K2o',	'64o','Q6o','53o','85o','T6o',
		'Q5o','43o','Q4o','Q3o','74o',	'Q2o','J6o','63o','J5o','95o',
		'52o','J4o','J3o','42o','J2o',	'84o','T5o','T4o','32o','T3o',
		'73o','T2o','62o','94o','93o',	'92o','83o','82o','72o'
	],[
		'AAo','KKo','QQo','JJo','TTo',	'99o','88o','AKs','77o','AQs',
		'AJs','AKo','ATs','AQo','AJo',	'KQs','66o','A9s','ATo','KJs',
		'A8s','KTs','KQo','A7s','A9o',	'KJo','55o','QJs','K9s','A5s',
		'A6s','A8o','KTo','QTs','A4s',	'A7o','K8s','A3s','QJo','K9o',
		'A5o','A6o','Q9s','K7s','JTs',	'A2s','QTo','44o','A4o','K6s',
		'K8o','Q8s','A3o','K5s','J9s',	'Q9o','JTo','K7o','A2o','K4s',
		'Q7s','K6o','K3s','T9s','J8s',	'33o','Q6s','Q8o','K5o','J9o',
		'K2s','Q5s','T8s','K4o','J7s',	'Q4s','Q7o','T9o','J8o','K3o',
		'Q6o','Q3s','98s','T7s','J6s',	'K2o','22o','Q2s','Q5o','J5s',
		'T8o','J7o','Q4o','97s','J4s',	'T6s','J3s','Q3o','98o','87s',
		'T7o','J6o','96s','J2s','Q2o',	'T5s','J5o','T4s','97o','86s',
		'J4o','T6o','95s','T3s','76s',	'J3o','87o','T2s','85s','96o',
		'J2o','T5o','94s','75s','T4o',	'93s','86o','65s','84s','95o',
		'T3o','92s','76o','74s','T2o',	'54s','85o','64s','83s','94o',
		'75o','82s','73s','93o','65o',	'53s','63s','84o','92o','43s',
		'74o','72s','54o','64o','52s',	'62s','83o','42s','82o','73o',
		'53o','63o','32s','43o','72o',	'52o','62o','42o','32o'
	]
]
const PREFLOPHANDS = {
	'AAo':{'stats':[[0,100],[0,100]],'chen':[20,100],'sklansky':{'malmuth':[1,100],'chubukov':[500,100]}},'KKo':{'stats':[[1,99.4047619047619],[1,99.4047619047619]],'chen':[16,80.95238095238095],'sklansky':{'malmuth':[1,100],'chubukov':[477,95.39170506912441]}},'QQo':{'stats':[[2,98.80952380952381],[2,98.80952380952381]],'chen':[14,71.42857142857143],'sklansky':{'malmuth':[1,100],'chubukov':[239,47.70587056702063]}},'JJo':{'stats':[[4,97.61904761904762],[3,98.21428571428571]],'chen':[12,61.904761904761905],'sklansky':{'malmuth':[1,100],'chubukov':[160,31.877379282708876]}},'TTo':{'stats':[[9,94.64285714285714],[4,97.61904761904762]],'chen':[10,52.38095238095238],'sklansky':{'malmuth':[2,87.5],'chubukov':[120,23.862953315968742]}},'99o':{'stats':[[16,90.47619047619048],[5,97.02380952380952]],'chen':[9,47.61904761904762],'sklansky':{'malmuth':[3,75],'chubukov':[96,19.054297735924663]}},'88o':{'stats':[[20,88.0952380952381],[6,96.42857142857143]],'chen':[8,42.857142857142854],'sklansky':{'malmuth':[4,62.5],'chubukov':[80,15.84852734922861]}},'AKs':{'stats':[[3,98.21428571428571],[7,95.83333333333333]],'chen':[10,52.38095238095238],'sklansky':{'malmuth':[1,100],'chubukov':[277,55.31957523542377]}},'77o':{'stats':[[28,83.33333333333333],[8,95.23809523809524]],'chen':[7,38.095238095238095],'sklansky':{'malmuth':[5,50],'chubukov':[67,13.243838910038066]}},'AQs':{'stats':[[5,97.02380952380952],[9,94.64285714285714]],'chen':[9,47.61904761904762],'sklansky':{'malmuth':[2,87.5],'chubukov':[137,27.2690843518333]}},'AJs':{'stats':[[7,95.83333333333333],[10,94.04761904761905]],'chen':[8,42.857142857142854],'sklansky':{'malmuth':[2,87.5],'chubukov':[92,18.25285513925065]}},'AKo':{'stats':[[10,94.04761904761905],[11,93.45238095238095]],'chen':[8,42.857142857142854],'sklansky':{'malmuth':[2,87.5],'chubukov':[166,33.07954317771989]}},'ATs':{'stats':[[11,93.45238095238095],[12,92.85714285714286]],'chen':[7,38.095238095238095],'sklansky':{'malmuth':[3,75],'chubukov':[70,13.844920857543576]}},'AQo':{'stats':[[17,89.88095238095238],[13,92.26190476190476]],'chen':[7,38.095238095238095],'sklansky':{'malmuth':[3,75],'chubukov':[96,19.054297735924663]}},'AJo':{'stats':[[26,84.52380952380952],[14,91.66666666666667]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[4,62.5],'chubukov':[68,13.44419955920657]}},'KQs':{'stats':[[6,96.42857142857143],[15,91.07142857142857]],'chen':[9,47.61904761904762],'sklansky':{'malmuth':[2,87.5],'chubukov':[43,8.435183329993988]}},'66o':{'stats':[[35,79.16666666666667],[16,90.47619047619048]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[5,50],'chubukov':[58,11.440593067521538]}},'A9s':{'stats':[[18,89.28571428571429],[17,89.88095238095238]],'chen':[7,38.095238095238095],'sklansky':{'malmuth':[5,50],'chubukov':[52,10.238429172510518]}},'ATo':{'stats':[[41,75.5952380952381],[18,89.28571428571429]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[6,37.5],'chubukov':[53,10.438789821679022]}},'KJs':{'stats':[[8,95.23809523809524],[19,88.69047619047619]],'chen':[8,42.857142857142854],'sklansky':{'malmuth':[3,75],'chubukov':[36,7.032658785814466]}},'A8s':{'stats':[[23,86.30952380952381],[20,88.0952380952381]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[5,50],'chubukov':[45,8.835904628330995]}},'KTs':{'stats':[[13,92.26190476190476],[21,87.5]],'chen':[7,38.095238095238095],'sklansky':{'malmuth':[4,62.5],'chubukov':[31,6.03085553997195]}},'KQo':{'stats':[[19,88.69047619047619],[22,86.9047619047619]],'chen':[7,38.095238095238095],'sklansky':{'malmuth':[4,62.5],'chubukov':[29,5.630134241634942]}},'A7s':{'stats':[[29,82.73809523809524],[23,86.30952380952381]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[5,50],'chubukov':[40,7.834101382488479]}},'A9o':{'stats':[[75,55.357142857142854],[24,85.71428571428571]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[8,12.5],'chubukov':[41,8.034462031656982]}},'KJo':{'stats':[[30,82.14285714285714],[25,85.11904761904762]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[5,50],'chubukov':[25,4.828691644960929]}},'55o':{'stats':[[45,73.21428571428572],[26,84.52380952380952]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[6,37.5],'chubukov':[49,9.637347225005009]}},'QJs':{'stats':[[12,92.85714285714286],[27,83.92857142857143]],'chen':[9,47.61904761904762],'sklansky':{'malmuth':[3,75],'chubukov':[25,4.828691644960929]}},'K9s':{'stats':[[21,87.5],[28,83.33333333333333]],'chen':[7,38.095238095238095],'sklansky':{'malmuth':[7,25],'chubukov':[24,4.628330995792426]}},'A5s':{'stats':[[27,83.92857142857143],[29,82.73809523809524]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[5,50],'chubukov':[36,7.032658785814466]}},'A6s':{'stats':[[33,80.35714285714286],[30,82.14285714285714]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[5,50],'chubukov':[35,6.832298136645963]}},'A8o':{'stats':[[90,46.42857142857143],[31,81.54761904761905]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[36,7.032658785814466]}},'KTo':{'stats':[[44,73.80952380952381],[32,80.95238095238095]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[6,37.5],'chubukov':[23,4.427970346623923]}},'QTs':{'stats':[[14,91.66666666666667],[33,80.35714285714286]],'chen':[8,42.857142857142854],'sklansky':{'malmuth':[4,62.5],'chubukov':[22,4.22760969745542]}},'A4s':{'stats':[[31,81.54761904761905],[34,79.76190476190476]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[5,50],'chubukov':[33,6.431576838308956]}},'A7o':{'stats':[[101,39.88095238095238],[35,79.16666666666667]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[31,6.03085553997195]}},'K8s':{'stats':[[36,78.57142857142857],[36,78.57142857142857]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[7,25],'chubukov':[20,3.8268883991184133]}},'A3s':{'stats':[[32,80.95238095238095],[37,77.97619047619048]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[5,50],'chubukov':[31,6.03085553997195]}},'QJo':{'stats':[[34,79.76190476190476],[38,77.38095238095238]],'chen':[7,38.095238095238095],'sklansky':{'malmuth':[5,50],'chubukov':[16,3.0254458024443998]}},'K9o':{'stats':[[80,52.38095238095238],[39,76.78571428571428]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[8,12.5],'chubukov':[18,3.4261671007814067]}},'A5o':{'stats':[[100,40.476190476190474],[40,76.19047619047619]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[28,5.429773592466439]}},'A6o':{'stats':[[112,33.33333333333333],[41,75.5952380952381]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[28,5.429773592466439]}},'Q9s':{'stats':[[24,85.71428571428571],[42,75]],'chen':[8,42.857142857142854],'sklansky':{'malmuth':[5,50],'chubukov':[16,3.0254458024443998]}},'K7s':{'stats':[[43,74.4047619047619],[43,74.4047619047619]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[7,25],'chubukov':[19,3.62652774994991]}},'JTs':{'stats':[[15,91.07142857142857],[44,73.80952380952381]],'chen':[8,42.857142857142854],'sklansky':{'malmuth':[3,75],'chubukov':[18,3.4261671007814067]}},'A2s':{'stats':[[38,77.38095238095238],[45,73.21428571428572]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[5,50],'chubukov':[29,5.630134241634942]}},'QTo':{'stats':[[48,71.42857142857143],[46,72.61904761904762]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[6,37.5],'chubukov':[15,2.8250851532758965]}},'44o':{'stats':[[49,70.83333333333333],[47,72.02380952380952]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[7,25],'chubukov':[41,8.034462031656982]}},'A4o':{'stats':[[103,38.69047619047619],[48,71.42857142857143]],'chen':[2,14.285714285714286],'sklansky':{'malmuth':[9,0],'chubukov':[26,5.029052294129433]}},'K6s':{'stats':[[52,69.04761904761905],[49,70.83333333333333]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[7,25],'chubukov':[17,3.2258064516129035]}},'K8o':{'stats':[[111,33.92857142857143],[50,70.23809523809524]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[15,2.8250851532758965]}},'Q8s':{'stats':[[42,75],[51,69.64285714285714]],'chen':[7,38.095238095238095],'sklansky':{'malmuth':[9,0],'chubukov':[13,2.42436385493889]}},'A3o':{'stats':[[108,35.71428571428571],[52,69.04761904761905]],'chen':[2,14.285714285714286],'sklansky':{'malmuth':[9,0],'chubukov':[24,4.628330995792426]}},'K5s':{'stats':[[54,67.85714285714286],[53,68.45238095238095]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[7,25],'chubukov':[16,3.0254458024443998]}},'J9s':{'stats':[[25,85.11904761904762],[54,67.85714285714286]],'chen':[8,42.857142857142854],'sklansky':{'malmuth':[4,62.5],'chubukov':[13,2.42436385493889]}},'Q9o':{'stats':[[82,51.19047619047619],[55,67.26190476190476]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[8,12.5],'chubukov':[12,2.2240032057703867]}},'JTo':{'stats':[[46,72.61904761904762],[56,66.66666666666666]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[5,50],'chubukov':[12,2.2240032057703867]}},'K7o':{'stats':[[121,27.97619047619048],[57,66.07142857142857]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[14,2.624724504107393]}},'A2o':{'stats':[[116,30.95238095238095],[58,65.47619047619048]],'chen':[1,9.523809523809524],'sklansky':{'malmuth':[9,0],'chubukov':[23,4.427970346623923]}},'K4s':{'stats':[[57,66.07142857142857],[59,64.88095238095238]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[7,25],'chubukov':[15,2.8250851532758965]}},'Q7s':{'stats':[[60,64.28571428571428],[60,64.28571428571428]],'chen':[7,38.095238095238095],'sklansky':{'malmuth':[9,0],'chubukov':[11,2.0236425566018834]}},'K6o':{'stats':[[124,26.19047619047619],[61,63.69047619047619]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[13,2.42436385493889]}},'K3s':{'stats':[[58,65.47619047619048],[62,63.095238095238095]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[7,25],'chubukov':[14,2.624724504107393]}},'T9s':{'stats':[[22,86.9047619047619],[63,62.5]],'chen':[8,42.857142857142854],'sklansky':{'malmuth':[4,62.5],'chubukov':[11,2.0236425566018834]}},'J8s':{'stats':[[40,76.19047619047619],[64,61.904761904761905]],'chen':[7,38.095238095238095],'sklansky':{'malmuth':[6,37.5],'chubukov':[10,1.82328190743338]}},'33o':{'stats':[[50,70.23809523809524],[65,61.30952380952381]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[7,25],'chubukov':[33,6.431576838308956]}},'Q6s':{'stats':[[65,61.30952380952381],[66,60.714285714285715]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[9,0],'chubukov':[11,2.0236425566018834]}},'Q8o':{'stats':[[114,32.14285714285714],[67,60.11904761904762]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[9,0],'chubukov':[9.9,1.8032458425165296]}},'K5o':{'stats':[[127,24.404761904761898],[68,59.523809523809526]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[12,2.2240032057703867]}},'J9o':{'stats':[[79,52.976190476190474],[69,58.92857142857143]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[7,25],'chubukov':[8.9,1.6028851933480264]}},'K2s':{'stats':[[59,64.88095238095238],[70,58.333333333333336]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[7,25],'chubukov':[13,2.42436385493889]}},'Q5s':{'stats':[[68,59.523809523809526],[71,57.73809523809524]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[9,0],'chubukov':[10,1.82328190743338]}},'T8s':{'stats':[[37,77.97619047619048],[72,57.142857142857146]],'chen':[7,38.095238095238095],'sklansky':{'malmuth':[5,50],'chubukov':[8.7,1.5628130635143256]}},'K4o':{'stats':[[131,22.02380952380952],[73,56.54761904761905]],'chen':[2,14.285714285714286],'sklansky':{'malmuth':[9,0],'chubukov':[11,2.0236425566018834]}},'J7s':{'stats':[[63,62.5],[74,55.95238095238095]],'chen':[7,38.095238095238095],'sklansky':{'malmuth':[8,12.5],'chubukov':[8.6,1.542776998597475]}},'Q4s':{'stats':[[70,58.333333333333336],[75,55.357142857142854]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[9,0],'chubukov':[9.5,1.7231015828491283]}},'Q7o':{'stats':[[130,22.61904761904762],[76,54.76190476190476]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[9,0],'chubukov':[8.5,1.522740933680625]}},'T9o':{'stats':[[72,57.142857142857146],[77,54.166666666666664]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[7,25],'chubukov':[7.4,1.3023442195952715]}},'J8o':{'stats':[[107,36.30952380952381],[78,53.57142857142857]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[8,12.5],'chubukov':[7.4,1.3023442195952715]}},'K3o':{'stats':[[132,21.42857142857143],[79,52.976190476190474]],'chen':[2,14.285714285714286],'sklansky':{'malmuth':[9,0],'chubukov':[11,2.0236425566018834]}},'Q6o':{'stats':[[136,19.04761904761905],[80,52.38095238095238]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[8.1,1.4425966740132234]}},'Q3s':{'stats':[[71,57.73809523809524],[81,51.785714285714285]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[9,0],'chubukov':[8.9,1.6028851933480264]}},'98s':{'stats':[[39,76.78571428571428],[82,51.19047619047619]],'chen':[7,38.095238095238095],'sklansky':{'malmuth':[4,62.5],'chubukov':[7.6,1.3424163494289718]}},'T7s':{'stats':[[56,66.66666666666666],[83,50.595238095238095]],'chen':[7,38.095238095238095],'sklansky':{'malmuth':[9,0],'chubukov':[7.1,1.2422360248447202]}},'J6s':{'stats':[[78,53.57142857142857],[84,50]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[9,0],'chubukov':[7.4,1.3023442195952715]}},'K2o':{'stats':[[134,20.23809523809524],[85,49.404761904761905]],'chen':[1,9.523809523809524],'sklansky':{'malmuth':[9,0],'chubukov':[10,1.82328190743338]}},'22o':{'stats':[[51,69.64285714285714],[86,48.80952380952381]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[7,25],'chubukov':[24,4.628330995792426]}},'Q2s':{'stats':[[74,55.95238095238095],[87,48.214285714285715]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[8.3,1.4826688038469245]}},'Q5o':{'stats':[[140,16.66666666666667],[88,47.61904761904762]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[7.5,1.3223802845121218]}},'J5s':{'stats':[[81,51.785714285714285],[89,47.023809523809526]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[9,0],'chubukov':[7,1.2221999599278701]}},'T8o':{'stats':[[99,41.07142857142857],[90,46.42857142857143]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[8,12.5],'chubukov':[6.1,1.041875375676217]}},'J7o':{'stats':[[128,23.80952380952381],[91,45.833333333333336]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[9,0],'chubukov':[6.3,1.0819475055099177]}},'Q4o':{'stats':[[142,15.476190476190482],[92,45.23809523809524]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[6.8,1.1821278300941696]}},'97s':{'stats':[[53,68.45238095238095],[93,44.642857142857146]],'chen':[7,38.095238095238095],'sklansky':{'malmuth':[5,50],'chubukov':[6.1,1.041875375676217]}},'J4s':{'stats':[[85,49.404761904761905],[94,44.04761904761905]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[9,0],'chubukov':[6.5,1.1220196353436185]}},'T6s':{'stats':[[73,56.54761904761905],[95,43.45238095238095]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[9,0],'chubukov':[6,1.0218393107593666]}},'J3s':{'stats':[[86,48.80952380952381],[96,42.857142857142854]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[9,0],'chubukov':[6,1.0218393107593666]}},'Q3o':{'stats':[[143,14.88095238095238],[97,42.26190476190476]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[6.3,1.0819475055099177]}},'98o':{'stats':[[98,41.666666666666664],[98,41.666666666666664]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[7,25],'chubukov':[5.1,0.8415147265077138]}},'87s':{'stats':[[47,72.02380952380952],[99,41.07142857142857]],'chen':[7,38.095238095238095],'sklansky':{'malmuth':[5,50],'chubukov':[5.6,0.9416950510919654]}},'T7o':{'stats':[[123,26.785714285714292],[100,40.476190476190474]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[9,0],'chubukov':[5.1,0.8415147265077138]}},'J6o':{'stats':[[146,13.095238095238102],[101,39.88095238095238]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[5.4,0.9016229212582648]}},'96s':{'stats':[[67,60.11904761904762],[102,39.285714285714285]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[8,12.5],'chubukov':[5,0.8214786615908634]}},'J2s':{'stats':[[88,47.61904761904762],[103,38.69047619047619]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[5.6,0.9416950510919654]}},'Q2o':{'stats':[[145,13.69047619047619],[104,38.095238095238095]],'chen':[2,14.285714285714286],'sklansky':{'malmuth':[9,0],'chubukov':[5.7,0.9617311160088158]}},'T5s':{'stats':[[92,45.23809523809524],[105,37.5]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[9,0],'chubukov':[5,0.8214786615908634]}},'J5o':{'stats':[[148,11.904761904761898],[106,36.904761904761905]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[5,0.8214786615908634]}},'T4s':{'stats':[[94,44.04761904761905],[107,36.30952380952381]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[9,0],'chubukov':[4.6,0.7413344019234622]}},'97o':{'stats':[[118,29.76190476190476],[108,35.71428571428571]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[9,0],'chubukov':[4.3,0.6812262071729112]}},'86s':{'stats':[[61,63.69047619047619],[109,35.11904761904762]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[6,37.5],'chubukov':[4.5,0.7212983370066118]}},'J4o':{'stats':[[151,10.11904761904762],[110,34.52380952380952]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[4.5,0.7212983370066118]}},'T6o':{'stats':[[139,17.26190476190476],[111,33.92857142857143]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[4.3,0.6812262071729112]}},'95s':{'stats':[[87,48.214285714285715],[112,33.33333333333333]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[9,0],'chubukov':[4.1,0.6411540773392106]}},'T3s':{'stats':[[95,43.45238095238095],[113,32.73809523809524]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[9,0],'chubukov':[4.2,0.6611901422560609]}},'76s':{'stats':[[55,67.26190476190476],[114,32.14285714285714]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[9,0],'chubukov':[4.2,0.6611901422560609]}},'J3o':{'stats':[[152,9.523809523809518],[115,31.54761904761905]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[4,0.6211180124223602]}},'87o':{'stats':[[113,32.73809523809524],[116,30.95238095238095]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[8,12.5],'chubukov':[5.6,0.9416950510919654]}},'T2s':{'stats':[[97,42.26190476190476],[117,30.35714285714286]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[3.8,0.5810458825886595]}},'85s':{'stats':[[77,54.166666666666664],[118,29.76190476190476]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[8,12.5],'chubukov':[3.6,0.5409737527549588]}},'96o':{'stats':[[133,20.83333333333333],[119,29.16666666666667]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[3.5,0.5209376878381086]}},'J2o':{'stats':[[154,8.333333333333329],[120,28.57142857142857]],'chen':[2,14.285714285714286],'sklansky':{'malmuth':[9,0],'chubukov':[3.4,0.5009016229212583]}},'T5o':{'stats':[[156,7.142857142857139],[121,27.97619047619048]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[3.5,0.5209376878381086]}},'94s':{'stats':[[105,37.5],[122,27.38095238095238]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[9,0],'chubukov':[3.3,0.4808655580044079]}},'75s':{'stats':[[66,60.714285714285715],[123,26.785714285714292]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[6,37.5],'chubukov':[3.3,0.4808655580044079]}},'T4o':{'stats':[[157,6.547619047619051],[124,26.19047619047619]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[3.1,0.4407934281707073]}},'93s':{'stats':[[106,36.904761904761905],[125,25.595238095238102]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[9,0],'chubukov':[3,0.42075736325385693]}},'86o':{'stats':[[125,25.595238095238102],[126,25]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[3,0.42075736325385693]}},'65s':{'stats':[[62,63.095238095238095],[127,24.404761904761898]],'chen':[6,33.333333333333336],'sklansky':{'malmuth':[6,37.5],'chubukov':[3.1,0.4407934281707073]}},'84s':{'stats':[[93,44.642857142857146],[128,23.80952380952381]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[9,0],'chubukov':[2.8,0.38068523342015625]}},'95o':{'stats':[[149,11.30952380952381],[129,23.214285714285708]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[2.8,0.38068523342015625]}},'T3o':{'stats':[[159,5.357142857142861],[130,22.61904761904762]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[2.7,0.360649168503306]}},'92s':{'stats':[[110,34.52380952380952],[131,22.02380952380952]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[2.7,0.360649168503306]}},'76o':{'stats':[[-1,100.5952380952381],[132,21.42857142857143]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[8,12.5],'chubukov':[2.7,0.360649168503306]}},'74s':{'stats':[[-1,100.5952380952381],[133,20.83333333333333]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[8,12.5],'chubukov':[2.6,0.34061310358645563]}},'T2o':{'stats':[[161,4.166666666666671],[134,20.23809523809524]],'chen':[2,14.285714285714286],'sklansky':{'malmuth':[9,0],'chubukov':[2.4,0.30054097375275496]}},'54s':{'stats':[[64,61.904761904761905],[135,19.64285714285714]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[6,37.5],'chubukov':[2.4,0.30054097375275496]}},'85o':{'stats':[[138,17.85714285714286],[136,19.04761904761905]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[2.4,0.30054097375275496]}},'64s':{'stats':[[69,58.92857142857143],[137,18.45238095238095]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[7,25],'chubukov':[2.4,0.30054097375275496]}},'83s':{'stats':[[115,31.54761904761905],[138,17.85714285714286]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[9,0],'chubukov':[2.2,0.26046884391905434]}},'94o':{'stats':[[163,2.9761904761904816],[139,17.26190476190476]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[2.2,0.26046884391905434]}},'75o':{'stats':[[120,28.57142857142857],[140,16.66666666666667]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[2.1,0.24043277900220397]}},'82s':{'stats':[[117,30.35714285714286],[141,16.07142857142857]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[2.1,0.24043277900220397]}},'73s':{'stats':[[102,39.285714285714285],[142,15.476190476190482]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[9,0],'chubukov':[2,0.22039671408535366]}},'93o':{'stats':[[164,2.3809523809523796],[143,14.88095238095238]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[2,0.22039671408535366]}},'65o':{'stats':[[122,27.38095238095238],[144,14.285714285714292]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[8,12.5],'chubukov':[2,0.22039671408535366]}},'53s':{'stats':[[76,54.76190476190476],[145,13.69047619047619]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[7,25],'chubukov':[1.9,0.20036064916850327]}},'63s':{'stats':[[89,47.023809523809526],[146,13.095238095238102]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[9,0],'chubukov':[1.9,0.20036064916850327]}},'84o':{'stats':[[155,7.738095238095241],[147,12.5]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[1.9,0.20036064916850327]}},'92o':{'stats':[[165,1.7857142857142918],[148,11.904761904761898]],'chen':[2,14.285714285714286],'sklansky':{'malmuth':[9,0],'chubukov':[1.8,0.18032458425165296]}},'43s':{'stats':[[83,50.595238095238095],[149,11.30952380952381]],'chen':[5,28.571428571428573],'sklansky':{'malmuth':[7,25],'chubukov':[1.7,0.16028851933480265]}},'74o':{'stats':[[144,14.285714285714292],[150,10.714285714285708]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[1.7,0.16028851933480265]}},'72s':{'stats':[[119,29.16666666666667],[151,10.11904761904762]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[1.6,0.1402524544179523]}},'54o':{'stats':[[126,25],[152,9.523809523809518]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[8,12.5],'chubukov':[1.6,0.1402524544179523]}},'64o':{'stats':[[135,19.64285714285714],[153,8.92857142857143]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[1.6,0.1402524544179523]}},'52s':{'stats':[[91,45.833333333333336],[154,8.333333333333329]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[1.6,0.1402524544179523]}},'62s':{'stats':[[109,35.11904761904762],[155,7.738095238095241]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[9,0],'chubukov':[1.5,0.12021638950110197]}},'83o':{'stats':[[166,1.1904761904761898],[156,7.142857142857139]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[1.5,0.12021638950110197]}},'42s':{'stats':[[96,42.857142857142854],[157,6.547619047619051]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[8,12.5],'chubukov':[1.4,0.10018032458425162]}},'82o':{'stats':[[167,0.595238095238102],[158,5.952380952380949]],'chen':[2,14.285714285714286],'sklansky':{'malmuth':[9,0],'chubukov':[1.4,0.10018032458425162]}},'73o':{'stats':[[160,4.761904761904759],[159,5.357142857142861]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[1.4,0.10018032458425162]}},'53o':{'stats':[[137,18.45238095238095],[160,4.761904761904759]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[1.3,0.08014425966740132]}},'63o':{'stats':[[147,12.5],[161,4.166666666666671]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[1.3,0.08014425966740132]}},'32s':{'stats':[[104,38.095238095238095],[162,3.5714285714285694]],'chen':[4,23.80952380952381],'sklansky':{'malmuth':[8,12.5],'chubukov':[1.3,0.08014425966740132]}},'43o':{'stats':[[141,16.07142857142857],[163,2.9761904761904816]],'chen':[3,19.047619047619047],'sklansky':{'malmuth':[9,0],'chubukov':[1.2,0.06010819475055097]}},'72o':{'stats':[[168,0],[164,2.3809523809523796]],'chen':[2,14.285714285714286],'sklansky':{'malmuth':[9,0],'chubukov':[1.1,0.040072129833700676]}},'52o':{'stats':[[150,10.714285714285708],[165,1.7857142857142918]],'chen':[2,14.285714285714286],'sklansky':{'malmuth':[9,0],'chubukov':[1.1,0.040072129833700676]}},'62o':{'stats':[[162,3.5714285714285694],[166,1.1904761904761898]],'chen':[2,14.285714285714286],'sklansky':{'malmuth':[9,0],'chubukov':[1.1,0.040072129833700676]}},'42o':{'stats':[[153,8.92857142857143],[167,0.595238095238102]],'chen':[2,14.285714285714286],'sklansky':{'malmuth':[9,0],'chubukov':[1,0.020036064916850328]}},'32o':{'stats':[[158,5.952380952380949],[168,0]],'chen':[2,14.285714285714286],'sklansky':{'malmuth':[9,0],'chubukov':[0.9,0]}}
}
const RANGE_CHEN = [-1,20], RANGE_SKLANSKYMALMUTH = [1,9], RANGE_SKLANSKYCHUBUKOV = [Math.sqrt(0.9),Math.sqrt(999)], RANGE_STAT = [0,168]

// Hand ranking functions for 2-card hands
// These are not directly used, as their input has been stitched together into a single object
const getSklanskyMalmuth = suit => {
	// The Sklansky-Malmuth table contains 2-card hands ranked from 1-9 by similar power
	// This function finds the rank for a given hand, then normalizes the position as a percentage of the range
	// Smaller is better
	if (suit.length > 3) return false
	let position = 9
	for (let i = 0; i < SKLANSKY[0].length; i++) {
		if (SKLANSKY[0][i].includes(suit)) position = i + 1
	}

	return [ 
		position, 
		100 - getPosition(position, RANGE_SKLANSKYMALMUTH[0], RANGE_SKLANSKYMALMUTH[1]) 
	]
}

const getSklanskyChubukov = suit => {
	// The Sklansky-Chubukov table represents the maximum stack size that should be present to go all-in
	// on any 2-card hand, granted certain assumptions
	// This function finds the rank for a given hand, then normalizes the position as a percentage of the range
	// Bigger is better
	if (suit.length > 3) return false
	let position = SKLANSKY[1][suit]
	return [ 
		position, 
		getPosition(Math.sqrt(position), RANGE_SKLANSKYCHUBUKOV[0], RANGE_SKLANSKYCHUBUKOV[1]) 
	]
}

const getChen = (cards, isPair=false, isSuited=false) => {
	// The Bill Chen Formula is an outdated estimation formula for determining the strength of a 2-card hand
	// This function finds the value for a given hand, then normalizes the position as a percentage of the range
	// Bigger is better
	
	// If `cards` is a string (e.g. AKo), it must be converted into an identity
	if (typeof cards == 'string') {
		if (!cards || cards == '' || cards.length > 3) return false
		let split = cards.split('')
		isSuited = (split.pop() == 's')
		isPair = (cards[0] == cards[1])
		cards = split.map(n => identify(CARDSTRINGS.indexOf(n)))
	} else {
		if (cards.length > 2) return false
	}
	
	// The base is a set value based on the highest card
	let total = [0,0,1,1.5,2,2.5,3,3.5,4,4.5,5,6,7,8,10][cards[0][2]]
	let diff = cards[0][2] - cards[1][2] - 1
	
	// Pairs count as double the value
	if (isPair) total = Math.max(total * 2, 5)

	// Suited hands gain 2 points
	if (isSuited) total += 2

	// The difference between the cards removes points if high
	if (diff > 0) {
		if (diff < 3) total -= diff
		if (diff == 3) total -= 4
		if (diff > 3) total -= 5
	}	
	
	// If both cards are smaller than a Queen and there is a difference is less than 2, add one point
	if (!isPair && cards[0][2] <= 12 && cards[1][2] <= 12 && diff < 2) {
		total++
	}

	return [
		total=Math.round(total),
		getPosition(total, RANGE_CHEN[0], RANGE_CHEN[1])
	]
}

const getStats = suit => {
	// I have gathered tables from 2 different studies presenting statistical win-chances for 2-card hands, then ranks them from best to worst
	// This function finds the rank for a given hand, then normalizes the position as a percentage of the range
	// Smaller is better
	if (suit.length > 3) return false
	let stats1 = STATS[0].indexOf(suit)
	let stats2 = STATS[1].indexOf(suit)
	let pos1 = getPosition(s1, RANGE_STAT[0], RANGE_STAT[1])
	let pos2 = getPosition(s2, RANGE_STAT[0], RANGE_STAT[1])

	return [ 
		[
			stats1, 
			100 - pos1
		], 
		[
			stats2, 
			100 - pos2
		] 
	]
}

// Stitch together all the 2-card hand functions into a single large object
// This only needed to be done once, but is carried forward in case any of the
// input data changes
function stitchPreflopHandsObject() {
	let combined = {}

	for (let i = 0; i < STATS[1].length; i++) {
		let s = STATS[1][i]
		let malmuth = getSklanskyMalmuth(s,0,RANGE_SKLANSKYMALMUTH)
		let chubukov = getSklanskyChubukov(s)
		let chen = getChen(s)
		combined[s] = {
			stats: getStats(s),
			chen, 
			sklansky: {
				malmuth, 
				chubukov
			}
		}
	}

	console.log(JSON.stringify(combined))
}

// General utility functions
const range = (n,x) => Array.from({length:(x-n)/1+1},(_,i)=>n+(i)).reverse()
const getPosition = (p,n,x) => ((p-n)*100)/(x-n)
const arrayEquals = (a,b) => (JSON.stringify(a) === JSON.stringify(b))
const arrayUnique = a => Array.from(new Set(a))

const identify = (c,ah=!0) => {
	// [ 0: card_index, 1: suit_index, 2: rank, 3: symbol ]
	let s = ((c-1) / 13) | 0
	let r = (c % (13 * (s || 1))) || 13
	let r2 = (r == 14) ? 1 : r
	let h = '&#x'+(127136 + (16 * (3-s)) + ((r2 < 12) ? r2 : r+1)).toString(16)+';'
	return [ c, s, (ah && r == 1) ? 14 : r, h ]
}

const identifyHand = h => {
	// Runs identify() for an array of card indexes
	let identity = h.map(c => identify(c))
	identity.sort((a, b) => b[2] - a[2])
	return identity
}

const deal = (n=1) => {
	// Deals an amount of cards from a virtual deck
	let deck = range(1,52)
	if (n > 52 || n <= 0) return false
	return Array.from({length:n},()=>deck.splice(Math.floor(Math.random()*deck.length-1)+1,1)[0])
}