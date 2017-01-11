import { LinkedList } from 'typescript-collections';

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
    let proposers = new LinkedList<number>();
    proposerPosition.forEach((pos, index) => proposers.add(index));


    for (let proposer = proposers.first(); !proposers.isEmpty(); proposer = proposers.first()) {
        let acceptor = proposerPrefs[proposer][proposerPosition[proposer]];

        let currentMatch = acceptorStatus[acceptor];
        // Acceptor currently single (always accepts)
        if (currentMatch === SINGLE) { 
            acceptorStatus[acceptor] = proposer;
            proposers.remove(proposer);
        } 
        // Accepter prefers proposer to current (proposer lower in pref list)
        else if (acceptorPrefs[acceptor][proposer] < acceptorPrefs[acceptor][currentMatch]) {
            proposers.remove(proposer);
            proposers.add(currentMatch);
            acceptorStatus[acceptor] = proposer;
        }
        proposerPosition[proposer]++;
    }

    return acceptorStatus;
}