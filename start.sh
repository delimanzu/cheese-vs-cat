#!/bin/bash

PORT=8000

echo ""
echo "🏜️  Desert Arena - Game Server"
echo "================================"
echo ""
echo "🎮 게임 접속 URL:"
echo ""
echo "   👉 http://localhost:$PORT"
echo ""
echo "================================"
echo "종료하려면 Ctrl+C"
echo ""

python3 -m http.server $PORT
