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

const binarySearch = counts => {
  // console.log('binary search: ', counts);
  let left = 0;
  let right = counts.length;
  while (left < right - 1) {
    // console.log('left', left);
    // console.log('right', right);
    const m = Math.floor((left + right) / 2);
    // console.log('m', m);
    const [sl, ml] = counts
      .slice(left, m)
      .reduce(([shrooms, matoes], [s, m]) => [shrooms + s, matoes + m], [0, 0]);
    const [sr, mr] = counts
      .slice(m, right + 1)
      .reduce(([shrooms, matoes], [s, m]) => [shrooms + s, matoes + m], [0, 0]);
    // console.log('sl, ml', sl, ml);
    // console.log('sr, mr', sr, mr);

    const leftRatio = sl / ml;
    const rightRatio = sr / mr;

    // console.log('leftRatio', leftRatio);
    // console.log('rightRatio', rightRatio);

    if (leftRatio < rightRatio) {
      right = m;
    } else if (leftRatio > rightRatio) {
      left = m + 1;
    } else {
      break;
    }
  }

  const m = Math.floor((left + right) / 2);
  const [sl, ml] = counts
    .slice(0, m)
    .reduce(([shrooms, matoes], [s, m]) => [shrooms + s, matoes + m]);
  const [sr, mr] = counts
    .slice(m, counts.length)
    .reduce(([shrooms, matoes], [s, m]) => [shrooms + s, matoes + m]);
  const leftRatio = sl / ml;
  const rightRatio = sr / mr;
  const miss = Math.abs(leftRatio) + Math.abs(rightRatio); // lower `miss` value is better

  return [m, miss];
};

const linearSearch = counts => {
  if (counts.length === 1) {
    return [-1, 0];
  }
  // console.log(counts);
  return Array(counts.length)
    .fill(0)
    .map((_, i) => i)
    .map(i => {
      const [sl, ml] = counts
        .slice(0, i)
        .reduce(([shrooms, matoes], [s, m]) => [shrooms + s, matoes + m], [
          0,
          0,
        ]);
      const [sr, mr] = counts
        .slice(i, counts.length)
        .reduce(([shrooms, matoes], [s, m]) => [shrooms + s, matoes + m], [
          0,
          0,
        ]);
      if ((sl < low || ml < low) && (sr < low || mr < low)) {
        return [-1, 10000];
      }
      const leftRatio = sl / ml;
      const rightRatio = sr / mr;
      // console.log('i', i);
      // console.log('sl, ml', sl, ml);
      // console.log('sr, mr', sr, mr);
      // console.log('leftRatio', leftRatio);
      // console.log('rightRatio', rightRatio);
      if (ml == 0 || sl == 0 || (mr == 0 || sr == 0)) {
        return [-1, 10000];
      }
      // if (ml == 0 || sl == 0) {
      //   return [i, rightRatio];
      // }
      // if (mr == 0 || sr == 0) {
      //   return [i, leftRatio];
      // }
      return [i, Math.abs(leftRatio - rightRatio)];
    })
    .reduce(
      ([i, minDiff], [j, diff]) => (diff < minDiff ? [j, diff] : [i, minDiff]),
    );
};

const findSplit = (slice, pizza) => {
  // console.log("find splits", slice, pizza);
  const [r1, c1, r2, c2] = slice;

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

  const [rowSplit, rowMiss] = linearSearch(rowCounts);
  const [colSplit, colMiss] = linearSearch(colCounts);

  // console.log('row split/miss', rowSplit, rowMiss);
  // console.log('col split/miss', colSplit, colMiss);

  if (rowSplit === -1 && colSplit === -1) {
    if ((r2 - r1 + 1) * (c2 - c1 + 1) > max) {
      // console.log("too big: ", r1, c1, r2, c2);
      return [];
    }
    const [sl, ml] = rowCounts.reduce(
      ([shrooms, matoes], [s, m]) => [shrooms + s, matoes + m],
      [0, 0],
    );
    if (sl < low || ml < low) {
      return [];
    }

    return [slice];
  }

  if (rowSplit === -1) {
    // col
    // console.log("col split");
    const leftSlice = [r1, c1, r2, c1 + colSplit - 1];
    const rightSlice = [r1, c1 + colSplit, r2, c2];
    // console.log("left slice", leftSlice);
    // console.log("right slice", rightSlice);

    const leftPizza = Array(r2 - r1 + 1)
      .fill(0)
      .map((_, i) => i + r1)
      .map(row => {
        return Array(c1 + colSplit - 1 - c1 + 1)
          .fill(0)
          .map((_, i) => i + c1)
          .map(col => truePizza[row][col]);
      });
    const rightPizza = Array(r2 - r1 + 1)
      .fill(0)
      .map((_, i) => i + r1)
      .map(row => {
        return Array(c2 - (c1 + colSplit) + 1)
          .fill(0)
          .map((_, i) => i + c1 + colSplit)
          .map(col => truePizza[row][col]);
      });

    const leftSplits = findSplit(leftSlice, leftPizza);
    const rightSplits = findSplit(rightSlice, rightPizza);
    return [...leftSplits, ...rightSplits];
  } else if (colSplit === -1) {
    // row
    // console.log("row split");
    const topSlice = [r1, c1, r1 + rowSplit - 1, c2];
    const bottomSlice = [r1 + rowSplit, c1, r2, c2];
    const topPizza = Array(r1 + rowSplit - 1 - r1 + 1)
      .fill(0)
      .map((_, i) => i + r1)
      .map(row => {
        return Array(c2 - c1 + 1)
          .fill(0)
          .map((_, i) => i + c1)
          .map(col => truePizza[row][col]);
      });
    const bottomPizza = Array(r2 - (r1 + rowSplit) + 1)
      .fill(0)
      .map((_, i) => i + r1 + rowSplit)
      .map(row => {
        return Array(c2 - c1 + 1)
          .fill(0)
          .map((_, i) => i + c1)
          .map(col => truePizza[row][col]);
      });

    const topSplits = findSplit(topSlice, topPizza);
    const bottomSplits = findSplit(bottomSlice, bottomPizza);

    return [...topSplits, ...bottomSplits];
  } else if (rowMiss < colMiss) {
    // row
    // console.log("row split");
    const topSlice = [r1, c1, r1 + rowSplit - 1, c2];
    const bottomSlice = [r1 + rowSplit, c1, r2, c2];
    const topPizza = Array(r1 + rowSplit - 1 - r1 + 1)
      .fill(0)
      .map((_, i) => i + r1)
      .map(row => {
        return Array(c2 - c1 + 1)
          .fill(0)
          .map((_, i) => i + c1)
          .map(col => truePizza[row][col]);
      });
    const bottomPizza = Array(r2 - (r1 + rowSplit) + 1)
      .fill(0)
      .map((_, i) => i + r1 + rowSplit)
      .map(row => {
        return Array(c2 - c1 + 1)
          .fill(0)
          .map((_, i) => i + c1)
          .map(col => truePizza[row][col]);
      });

    const topSplits = findSplit(topSlice, topPizza);
    const bottomSplits = findSplit(bottomSlice, bottomPizza);

    return [...topSplits, ...bottomSplits];
  } else {
    // col
    // console.log("col split");
    const leftSlice = [r1, c1, r2, c1 + colSplit - 1];
    const rightSlice = [r1, c1 + colSplit, r2, c2];
    // console.log("left slice", leftSlice);
    // console.log("right slice", rightSlice);

    const leftPizza = Array(r2 - r1 + 1)
      .fill(0)
      .map((_, i) => i + r1)
      .map(row => {
        // console.log("row ", row);
        return Array(c1 + colSplit - 1 - c1 + 1)
          .fill(0)
          .map((_, i) => i + c1)
          .map(col => truePizza[row][col]);
      });
    const rightPizza = Array(r2 - r1 + 1)
      .fill(0)
      .map((_, i) => i + r1)
      .map(row => {
        return Array(c2 - (c1 + colSplit) + 1)
          .fill(0)
          .map((_, i) => i + c1 + colSplit)
          .map(col => truePizza[row][col]);
      });

    const leftSplits = findSplit(leftSlice, leftPizza);
    const rightSplits = findSplit(rightSlice, rightPizza);
    return [...leftSplits, ...rightSplits];
  }
};

const splits = findSplit(
  [0, 0, truePizza.length - 1, truePizza[0].length - 1],
  truePizza,
);
// console.log(splits);
console.log(splits.length);
splits.forEach(s => console.log(s.join(' ')));
