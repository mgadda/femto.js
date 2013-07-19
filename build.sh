#!/usr/bin/env bash
jslint femto.js
java -jar ~/bin/compiler.jar --js femto.js --js_output_file femto.min.js
