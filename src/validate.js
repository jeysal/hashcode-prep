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

const output = String(readFileSync(outfile));
const [outputHeader, ...slices] = output.split('\n').slice(0, -1);
const numSlices = Number(outputHeader);
assert(numSlices === slices.length);

const used = Array(numRows)
  .fill(0)
  .map(() => Array(numCols).fill(false));
slices.forEach(outputCols => {
  const [r1, c1, r2, c2] = outputCols.split(' ').map(Number);
  const [cLow, cHigh] = [c1, c2].sort((a, b) => a - b);
  const [rLow, rHigh] = [r1, r2].sort((a, b) => a - b);
  const rs = Array(rHigh - rLow + 1)
    .fill(rLow)
    .map((val, i) => val + i);
  const cs = Array(cHigh - cLow + 1)
    .fill(cLow)
    .map((val, i) => val + i);

  // check overlap
  rs.forEach(r => cs.forEach(c => assert((used[r][c] ^= true))));

  // check low
  const shrooms = rs.reduce(
    (num, r) => num + cs.reduce((num, c) => num + (pizza[r][c] === 'M'), 0),
    0,
  );
  assert(shrooms >= low);
  const matoes = rs.reduce(
    (num, r) => num + cs.reduce((num, c) => num + (pizza[r][c] === 'T'), 0),
    0,
  );
  assert(matoes >= low);

  // check max
  assert(rs.length * cs.length <= max);
});
