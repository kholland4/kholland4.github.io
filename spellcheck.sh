#!/bin/bash
for i in "$@"; do
  HSRESULT=$(hunspell -H -u -p spellcheck_whitelist.txt $i)
  if [[ $HSRESULT ]]; then
    echo $i
    echo $HSRESULT
    exit 1
  fi
done
