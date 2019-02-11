- recursive breakdown to smaller parts
  - where each breakdown optimally contains same parts T and M
  - try every horizontal/vertical split
  - maybe completely start over after having placed a slice
  - stop splitting when low rule is impossible
- generally prefer small slices and enlarge them later

Caution: If a piece gets too long (e.g. just one column), 5 shrooms in a row will screw us over

Complexity guesses:
Divide and conquer: (n^2 + n log n) * n = n^3
Sliding window: n^2 * n^2 = n^4
