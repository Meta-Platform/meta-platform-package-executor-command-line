#!/bin/sh
rm -rf dist
node build.js
node --experimental-sea-config sea-config.json
cp $(command -v node) dist/exec-pkg
npx postject dist/exec-pkg NODE_SEA_BLOB dist/exec-pkg.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2