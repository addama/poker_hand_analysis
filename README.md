# Poker Hand Analysis Library

This library is a proof of concept for finding the current and future state of a given poker hand of any size between 2 and 7 cards. Attention has been paid to reducing the number of loops, but there is always room for improvement.

Most of the analysis is fairly straightforward, thanks to some state qualities being mutually exclusive, e.g. if you have a single duplicate, you cannot have a straight or a flush until held cards exceed 5. The bulk of the work went into using bitmasks to find straights in ordered sequences of cards.

In order to find straights, the hand is first ordered, descending. A secondary mask is created that intelligently adds up to 2 cards to the front and rear of the array, then fills in any gaps between cards. This is used to create the straight bitmask, which has a 0 for a missing card and a 1 for a held card. 

Once the straight bitmask is made, a rigid window of 5 cards is iterated up the bitmask array, looking for A) a window containing all held cards, B) a window missing only 1 card, or C) a window missing 2 cards. The first case indicates that a straight is held. The other two cases indicate that within 1 or 2 cards, a straight could exist, which is evaluated later when calculating outs.

The current and future state of the hand is only a third of the algorithm; the next third is determining 2-card hand fitness in the context of a game. Much of 7-card Poker rests in making decisions based on your first 2 cards.

This is done by comparing the hand's current and future state against several algorithms of various efficacy popularly used in Poker. These are: Sklansky & Malmuth, Sklansky & Chubukov, Chen, and two statistical analyses based on hand win percentages in Poker tournaments. The data from these algorithms has been boiled down into a single monolithic object that can be indexed quickly instead of calculating each algorithm's value for each hand. The original algorithm or array for each has been included, as well as the function to stitch everything together, in case the input data changes.

The last analysis the algorithm performs is calculating outs, which represent the number of cards "still out there" that could make a good hand. Most of the work of this is done while analyzing the current state of the hand, so this part is mostly just taking available data and making obvious judgements. For example, if you have a pair, you are 2 cards away from a quad, and so on. This is the area with the least polish, but it's also the area with the most unique states that need to be checked.

## How to use

```
/*
	A	2	3	4	5	6	7	8	9	10	J	Q	K
C	1	2	3	4	5	6	7	8	9	10	11	12	13
D	14	15	16	17	18	19	20	21	22	23	24	25	26
H	27	28	29	30	31	32	33	34	35	36	37	38	39
S	40	41	42	43	44	45	46	47	48	49	50	51	52
*/
```

1. Construct an array of 2-7 cards using the indexing scheme above. Each card is given a unique index from 1 to 52, Ace-low, with the suits arranged in Bridge order (Clubs, Diamonds, Hearts, Spades)
1. Pass this array to `analyze(1)`
1. Your results will vary depending on if your hand size is 2, or larger than 2, as each state has drastically different considerations

### Sample 2-Card Hand Output

Given hand is `Q5o`

```
{
    "cards": [	// card identities
        [
            51,	// card index
            3,	// suit index
            12,	// rank
            "&#x1f0ad;"	// unicode symbol
        ],
        [
            5,
            0,
            5,
            "&#x1f0d5;"
        ]
    ],
    "potential": {
        "stats": [	// two different statistical analyses
            [
                140,
                16.66666666666667
            ],
            [
                88,
                47.61904761904762
            ]
        ],
        "chen": [	// Bill Chen's Method
            4,
            23.80952380952381
        ],
        "sklansky": {
            "malmuth": [	// Sklansky & Malmuth index
                9,	// index
                0	// relative position within min-max bounds of this algorithm
            ],
            "chubukov": [	// Sklansky & Chubukov index
                7.5,	// maximum stack size needed to go all-in for this hand
                1.3223802845121218	// relative position
            ]
        }
    },
    "string": "Q5o"	// commonly used string representation of hand
}
```

### Sample 5-Card Hand Output

Given hand is `AKQJTo`

```
{
    "cards": [
        [
            1,
            0,
            14,
            "&#x1f0d1;"
        ],
        [
            13,
            0,
            13,
            "&#x1f0de;"
        ],
        [
            12,
            0,
            12,
            "&#x1f0dd;"
        ],
        [
            11,
            0,
            11,
            "&#x1f0db;"
        ],
        [
            10,
            0,
            10,
            "&#x1f0da;"
        ]
    ],
    "potential": {
        "hands": [	// potential hands within 1 or 2 cards
            9,
            5
        ],
        "straight": {
            "highCard": {	
                "within1": 14,
                "within2": 14
            },
            "within1": [
                [	// groupings of cards needed to make a straight within 1
                    [
                        13,
                        12,
                        11,
                        10,
                        9
                    ],
                    [	// the card needed to make a straight
                        9
                    ],
                    false,
                    false,
                    false
                ]
            ],
            "within2": [
                [	// groupings of cards needed to make a straight within 2
                    [
                        12,
                        11,
                        10,
                        9,
                        8
                    ],
                    [
                        9,
                        8
                    ],
                    false,
                    false,
                    false
                ]
            ]
        },
        "straightflush": {
            "within1": [],
            "within2": []
        },
        "flush": {
            "within1": false,
            "within2": false
        },
        "duplicates": {
            "trey": {
                "within1": false,
                "within2": true
            },
            "quad": {
                "within1": false,
                "within2": false
            },
            "fullhouse": {
                "within1": false,
                "within2": false
            }
        },
        "outs": 0
    },
    "string": "AKQJTo",	// common string representation of hand
    "hand": 0,	// currently held hand
    "current": {	// current state of hand
        "highCard": 14,
        "straight": true,
        "flush": true,
        "quad": false,
        "trey": false,
        "pair": false,
        "fullhouse": false,
        "twopair": false,
        "duplicates": [],
        "suits": [	// which ranks belong in which suit
            [
                14,
                13,
                12,
                11,
                10
            ],
            [],
            [],
            []
        ]
    }
}
```