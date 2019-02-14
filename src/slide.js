#!/usr/bin/env node
// @ts-check

const assert = require('assert').strict;
const { readFileSync } = require('fs');
const {
  argv: [, , infile, outfile],
} = require('process');

// input

const input = String(readFileSync(infile));
const [inputHeader, ...inputRows] = input.split('\n').slice(0, -1);
const [numRows, numCols, low, max] = inputHeader.split(' ').map(Number);
assert(numRows === inputRows.length);

const pizza = inputRows.map(row => row.split(''));

// output

const slices = [];
let numUsed = 0; // progress
const used = Array(numRows)
  .fill(0)
  .map(() => Array(numCols).fill(false));

// factors

const factors = num =>
  Array(num)
    .fill(0)
    .map((_, i) => i + 1)
    .map(factor => [factor, num / factor])
    .filter(([, factor]) => Number.isInteger(factor));

// slide

sizeLoop: for (let size = low * 2; size <= max; size++) {
  shapeLoop: for (let [h, w] of factors(size)) {
    if (h === 2 && w === 1) debugger;
    if (h > numRows || w > numCols) continue shapeLoop;

    pizzaRowsLoop: for (let r = 0; r <= numRows - h; r++) {
      pizzaColsLoop: for (let c = 0; c <= numCols - w; c++) {
        let shrooms = 0;
        let matoes = 0;

        sliceRowsLoop: for (let row = r; row < r + h; row++) {
          sliceColsLoop: for (let col = c; col < c + w; col++) {
            if (used[row][col]) continue pizzaColsLoop;

            if (pizza[row][col] === 'M') shrooms++;
            else matoes++;
          }
        }

        if (shrooms >= low && matoes >= low) {
          slices.push([r, c, r + h - 1, c + w - 1]);

          sliceRowsLoop: for (let row = r; row < r + h; row++) {
            sliceColsLoop: for (let col = c; col < c + w; col++) {
              used[row][col] = true;
              console.error('slide phase', ++numUsed);
            }
          }
        }
      }
    }
  }
}

// expand

sliceLoop: for (let slice of slices) {
  directionLoop: while (true) {
    const [r1, c1, r2, c2] = slice; // MUST be re-read as the slice is mutated

    // try up / down
    // ensure it would stay below max
    if ((r2 - r1 + 2) * (c2 - c1 + 1) <= max) {
      // try up
      // ensure there is an up
      if (r1 > 0) {
        // ensure up is unused
        if (
          Array(c2 - c1 + 1)
            .fill(c1)
            .map((val, i) => val + i)
            .every(c => !used[r1 - 1][c])
        ) {
          Array(c2 - c1 + 1)
            .fill(c1)
            .map((val, i) => val + i)
            .forEach(c => {
              used[r1 - 1][c] = true;
              console.error('expand phase', ++numUsed);
            });
          slice[0]--;
          continue directionLoop;
        }
      }

      // try down
      // ensure there is a down
      if (r2 < numRows - 1) {
        // ensure down is unused
        if (
          Array(c2 - c1 + 1)
            .fill(c1)
            .map((val, i) => val + i)
            .every(c => !used[r2 + 1][c])
        ) {
          Array(c2 - c1 + 1)
            .fill(c1)
            .map((val, i) => val + i)
            .forEach(c => {
              used[r2 + 1][c] = true;
              console.error('expand phase', ++numUsed);
            });
          slice[2]++;
          continue directionLoop;
        }
      }
    }

    // try left / right
    // ensure it would stay below max
    if ((r2 - r1 + 1) * (c2 - c1 + 2) <= max) {
      // try left
      // ensure there is a left
      if (c1 > 0) {
        // ensure left is unused
        if (
          Array(r2 - r1 + 1)
            .fill(r1)
            .map((val, i) => val + i)
            .every(r => !used[r][c1 - 1])
        ) {
          Array(r2 - r1 + 1)
            .fill(r1)
            .map((val, i) => val + i)
            .forEach(r => {
              used[r][c1 - 1] = true;
              console.error('expand phase', ++numUsed);
            });
          slice[1]--;
          continue directionLoop;
        }
      }

      // try down
      // ensure there is a down
      if (c2 < numCols - 1) {
        // ensure down is unused
        if (
          Array(r2 - r1 + 1)
            .fill(r1)
            .map((val, i) => val + i)
            .every(r => !used[r][c2 + 1])
        ) {
          Array(r2 - r1 + 1)
            .fill(r1)
            .map((val, i) => val + i)
            .forEach(r => {
              used[r][c2 + 1] = true;
              console.error('expand phase', ++numUsed);
            });
          slice[3]++;
          continue directionLoop;
        }
      }
    }

    break directionLoop;
  }
}

// print output

console.log(slices.length);
slices.forEach(([r1, c1, r2, c2]) => console.log(`${r1} ${c1} ${r2} ${c2}`));
