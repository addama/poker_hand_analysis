# Poker Hand Analysis Library

This library is a proof of concept for finding the current and future state of a given poker hand of any size between 2 and 7 cards. Attention has been paid to reducing the number of loops, but there is always room for improvement.

Most of the analysis is fairly straightforward, thanks to some state qualities being mutually exclusive, e.g. if you have a single duplicate, you cannot have a straight or a flush until held cards exceed 5. The bulk of the work went into using bitmasks to find straights in ordered sequences of cards.

In order to find straights, the hand is first ordered, descending. A secondary mask is created that intelligently adds up to 2 cards to the front and rear of the array, then fills in any gaps between cards. This is used to create the straight bitmask, which has a 0 for a missing card and a 1 for a held card. 

Once the straight bitmask is made, a rigid window of 5 cards is iterated up the bitmask array, looking for A) a window containing all held cards, B) a window missing only 1 card, or C) a window missing 2 cards. The first case indicates that a straight is held. The other two cases indicate that within 1 or 2 cards, a straight could exist, which is evaluated later when calculating outs.

The current and future state of the hand is only a third of the algorithm; the next third is determining 2-card hand fitness in the context of a game. Much of 7-card Poker rests in making decisions based on your first 2 cards.

This is done by comparing the hand's current and future state against several algorithms of various efficacy popularly used in Poker. These are: Sklansky & Malmuth, Sklansky & Chubukov, Chen, and two statistical analyses based on hand win percentages in Poker tournaments. The data from these algorithms has been boiled down into a single monolithic object that can be indexed quickly instead of calculating each algorithm's value for each hand. The original algorithm or array for each has been included, as well as the function to stitch everything together, in case the input data changes.

The last analysis the algorithm performs is calculating outs, which represent the number of cards "still out there" that could make a good hand. Most of the work of this is done while analyzing the current state of the hand, so this part is mostly just taking available data and making obvious judgements. For example, if you have a pair, you are 2 cards away from a quad, and so on. This is the area with the least polish, but it's also the area with the most unique states that need to be checked.