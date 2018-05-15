#!/usr/bin/env node

const chokidar = require('chokidar');
const {execSync, spawn} = require('child_process');

chokidar.watch(process.argv[2])
.on('change', () => {
  console.log('rebuild');
  execSync('npm run build', {stdio: 'inherit'});
});

const sub = spawn('npm', ['start'], {
  stdio: 'inherit',
});

sub.on('exit', code => {
  process.exit(code);
});
