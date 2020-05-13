#!/bin/bash
set -e
PATH=$(npm bin):$PATH

rm -rf ./dist

NODE_ENV=production webpack
NODE_ENV=production COMPRESS=1 webpack
