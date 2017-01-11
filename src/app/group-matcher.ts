import { Queue } from 'typescript-collections';

/*
function stableMatching {
    Initialize all m ∈ M and w ∈ W to free
    while ∃ free man m who still has a woman w to propose to {
       w = first woman on m’s list to whom m has not yet proposed
       if w is free
         (m, w) become engaged
       else some pair (m', w) already exists
         if w prefers m to m'
            m' becomes free
           (m, w) become engaged 
         else
           (m', w) remain engaged
    }
}
*/

const SINGLE = -1;

export function galeShapley(proposerPrefs: Array<Array<number>>, acceptorPrefs: Array<Array<number>>) {
        let n = proposerPrefs.length;

        let acceptorStatus = new Array<number>(n).fill(SINGLE);
        let proposerPosition = new Array<number>(n).fill(0);
        let proposers = new Queue<number>();

        proposerPosition.forEach((pos, index) => proposers.enqueue(index));


        for (let proposer = proposers.dequeue(); !proposers.isEmpty(); proposer = proposers.dequeue()) {
            let acceptor = proposerPrefs[proposer][proposerPosition[proposer]];

            let current = acceptorStatus[acceptor];
            if (current === SINGLE) {
                acceptorStatus[acceptor] = proposer;
            } else if (acceptorPrefs[acceptor][proposer] > acceptorPrefs[acceptor][current]) {
                proposers.enqueue(current);
                acceptorStatus[acceptor] = proposer;
                proposerPosition[current]++;
            } else {
                proposerPosition[proposer]++;
                proposers.enqueue(proposer);
            }

        }

        return acceptorStatus;
    }