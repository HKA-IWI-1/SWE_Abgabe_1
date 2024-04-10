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

# Aufruf:   .\dive.sh [distroless|wolfi|bookworm]

# "Param" muss in der 1. Zeile sein
base=${1}

# Titel setzen
# https://apple.stackexchange.com/questions/364723/how-do-i-set-the-terminal-tab-title-via-command-line
echo -en "\033]1; dive \007"

diveVersion='v0.12.0'
imagePrefix='juergenzimmermann/'
imageBase='buch'
imageTag="2024.04.0-$base"
image="$imagePrefix${imageBase}:$imageTag"

# image='gcr.io/distroless/nodejs20-debian12:nonroot'
# image='node:20.7.0-bookworm-slim'
# image='cgr.dev/chainguard/node:latest'

# https://github.com/wagoodman/dive#installation
docker run --rm --interactive --tty \
  --mount type='bind,source=/var/run/docker.sock,destination=/var/run/docker.sock' \
  --hostname dive --name dive \
  --read-only --cap-drop ALL \
  wagoodman/dive:$diveVersion $image
