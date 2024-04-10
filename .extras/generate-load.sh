#!/bin/bash
#
# Copyright (c) 2024 - present Florian Sauer
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
# documentation files (the “Software”), to deal in the Software without restriction, including without limitation the
# rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions
# of the Software.
#
# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
# LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
# IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
# WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#
#

# Aufruf:   ./generate-load.sh [ingress]

# Set-StrictMode -Version Latest

# Titel setzen
# https://apple.stackexchange.com/questions/364723/how-do-i-set-the-terminal-tab-title-via-command-line
echo -en "\033]1; generate-load \007"

for ((index=1; ; index++))
do
  if [ $((index%2)) = 0 ]
  then
    id=20
  elif [ $((index%3)) = 0 ]
  then
    id=30
  elif [ $((index%5)) = 0 ]
  then
    id=40
  elif [ $((index%7)) = 0 ]
  then
    id=50
  else
    id=1
  fi

  url="https://localhost:3000/rest/$id"
  #$url = "http://localhost:3000/rest/$id"

  curl -k --tlsv1.3 \
    -H "Accept: application/hal+json" \
    $url \
    > /dev/null
    # Option `--tlsv1.3` wird im aktuellen Build von libcurl für macOS 14.4.1 nicht unterstützt

  sleep 0.3
done
