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

// algorithm

sliceLoop: while (true) {
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
                console.error(++numUsed);
              }
            }

            continue sliceLoop;
          }
        }
      }
    }
  }

  break sliceLoop;
}

console.log(slices.length);
slices.forEach(([r1, c1, r2, c2]) => console.log(`${r1} ${c1} ${r2} ${c2}`));
