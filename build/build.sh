#!/bin/sh
# 다시 만들기: content.js·app.js·page.src.html 수정 → sh build.sh
set -e
cd "$(dirname "$0")"
node gen.js
python3 kg_build.py
cp ../index.html /tmp/dvl_pre.html
python3 tools/retrofit.py /tmp/dvl_pre.html --kg ../kg/kg.json --refs ../kg/refs.json --meta ../kg/meta.json --backbone tools/backbone_ai.json -o ../index.html
python3 tools/check.py /tmp/dvl_pre.html ../index.html --backbone tools/backbone_ai.json --registry tools/KG_00_registry.json --report ../kg/check_report.md
# 분야 뼈대 주제 다시 걸기(kg/rehang.json 덧씌우기) — 빌드할 때마다 다시 적용
python3 ../kg/rehang.py apply ..
