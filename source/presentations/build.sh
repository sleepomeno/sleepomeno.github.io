#!/bin/bash

pandoc lambdaheads-purescript.md --template=./default.revealjs -V theme:moon -V transition:none -V controls:false -V revealjs-url:./ -o lambdaheads-purescript.html -t revealjs
pandoc lambdaheads-frp.md --template=./default.revealjs -V theme:moon -V transition:none -V controls:true -V revealjs-url:./ -o lambdaheads-frp.html -t revealjs
