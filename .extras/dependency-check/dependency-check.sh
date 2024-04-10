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

# Aufruf:   .\dependency-check.sh pathToZimmermann
# - z.B. ./dependency-check.sh /Users/maxmustermann/Zimmermann

pathZimmermmann=${1}

if [ "$pathZimmermmann" = "" ]
then
    echo "Bitte den Pfad zum Ordner \"Zimmermann\" angeben."
    exit 1
fi

# Titel setzen
# https://apple.stackexchange.com/questions/364723/how-do-i-set-the-terminal-tab-title-via-command-line
echo -en "\033]1; dependency-check \007"

nvdApiKey='47fbc0a4-9240-4fda-9a26-d7d5624c16bf'
project='buch'

if [ ! -e $pathZimmermmann ]
then
  echo "Unter dem angegeben Pfad konnte kein passendes Shell-Skript für OWASP Dependency-Check gefunden werden."
  echo "Pfad: ${pathZimmermmann}"
fi

${pathZimmermmann}/dependency-check/bin/dependency-check.sh \
  --nvdApiKey $nvdApiKey \
  --project $project \
  --scan ../.. \
  --suppression suppression.xml \
  --out . \
  --data ${pathZimmermmann}/Zimmermann/dependency-check-data \
  --disableAssembly \
  --disableAutoconf \
  --disableBundleAudit \
  --disableCentral \
  --disableCmake \
  --disableCocoapodsAnalyzer \
  --disableComposer \
  --disableCpan \
  --disableDart \
  --disableGolangDep \
  --disableGolangMod \
  --disableJar \
  --disableMavenInstall \
  --disableMSBuild \
  --disableNugetconf \
  --disableNuspec \
  --disablePip \
  --disablePipfile \
  --disablePnpmAudit \
  --disablePoetry \
  --disablePyDist \
  --disablePyPkg \
  --disableRubygems \
  --disableSwiftPackageManagerAnalyzer \
  --disableYarnAudit
