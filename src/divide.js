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

const truePizza = inputRows.map(row => row.split(''));

const binarySearch = (counts) => {
  let left = 0;
  let right = counts.length - 1;
  while (left <= right) {
    const m = Math.floor((left + right) / 2);
    const [sl, ml] = counts.slice(left, m).reduce(([shrooms, matoes], [s, m]) => [shrooms + s, matoes + m]);
    const [sr, mr] = counts.slice(m, right + 1).reduce(([shrooms, matoes], [s, m]) => [shrooms + s, matoes + m]);

    const leftDiff = sl - ml;
    const rightDiff = sr - mr;

    if (leftDiff < rightDiff) {
      right = m - 1;
    } else if (leftDiff > rightDiff) {
      left = m + 1;
    } else {
      break;
    }
  }

  const m = Math.floor((left + right) / 2);
  const [sl, ml] = counts.slice(left, m).reduce(([shrooms, matoes], [s, m]) => [shrooms + s, matoes + m]);
  const [sr, mr] = counts.slice(m, right + 1).reduce(([shrooms, matoes], [s, m]) => [shrooms + s, matoes + m]);
  const leftDiff = sl - ml;
  const rightDiff = sr - mr;
  const miss = Math.abs(leftDiff) + Math.abs(rightDiff); // lower `miss` value is better

  return [m, miss];
};

const findSplit = pizza => {
  const rowCounts = pizza.map(row =>
    row.reduce(
      ([shrooms, matoes], e) => [shrooms + (e == 'M'), matoes + (e == 'T')],
      [0, 0],
    ),
  );

  const colCounts = Array(pizza[0].length)
    .fill(0)
    .map((_, i) => i)
    .map(colIndex => {
      return Array(pizza.length)
        .fill(0)
        .map((_, i) => i)
        .reduce(
          ([shrooms, matoes], rowIndex) => [
            shrooms + (pizza[rowIndex][colIndex] == 'M'),
            matoes + (pizza[rowIndex][colIndex] == 'T'),
          ],
          [0, 0],
        );
    });

  const [rowSplit, rowMiss] = binarySearch(rowCounts);
  const [colSplit, colMiss] = binarySearch(colCounts);

  console.log(rowSplit);
  console.log(rowMiss);
  console.log(colSplit);
  console.log(colMiss);
};

findSplit(truePizza);
