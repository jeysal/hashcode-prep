#!/usr/bin/env node
// @ts-check

const { readFileSync } = require('fs');
const {
  argv: [, , outfile],
} = require('process');
const data = String(readFileSync(outfile));

function parseOutput(data) {
  const lines = data.split('\n');
  const slices = parseInt(lines[0]);

  return Array(slices)
    .fill(0)
    .map((_, i) => lines[i + 1])
    .map(line => line.split(' ').map(v => parseInt(v)));
}

function score(data) {
  return parseOutput(data)
    .map(([r1, c1, r2, c2]) => {
      const rows = Math.abs(r1 - r2) + 1;
      const columns = Math.abs(c1 - c2) + 1;

      return rows * columns;
    })
    .reduce((a, b) => a + b, 0);
}

console.log(score(data));
