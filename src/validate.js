#!/usr/bin/env node
// @ts-check

const { readFileSync } = require('fs');
const {
  argv: [, , infile, outfile],
} = require('process');
console.log(String(readFileSync(infile)));
console.log(String(readFileSync(outfile)));
