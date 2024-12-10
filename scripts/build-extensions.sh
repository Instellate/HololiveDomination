#!/bin/bash
cd ../Extension

yarn build
yarn build:firefox

cd .output
web-ext build --source-dir chrome-mv3 --artifacts-dir chrome-artifacts -o
web-ext build --source-dir firefox-mv2 --artifacts-dir firefox-artifacts -o
