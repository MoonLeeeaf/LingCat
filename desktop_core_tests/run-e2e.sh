#!/usr/bin/env bash
# 启动一个隔离数据目录的 LingCat 服务端，然后运行 C# 端到端测试。
# 用法: ./desktop_core_tests/run-e2e.sh [数据目录] [端口]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DATA_DIR="${1:-/tmp/opencode/lingcat-e2e}"
PORT="${2:-3601}"

mkdir -p "$DATA_DIR"
cd "$DATA_DIR"
rm -rf lingcat_data

# 清掉占用端口的旧进程，避免连到上一次的服务端
fuser -k "$PORT/tcp" 2>/dev/null || true

setsid npx --yes tsx "$REPO_ROOT/server/main.ts" > server.log 2>&1 &
SERVER_PID=$!

cleanup() {
    kill -- -"$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT

echo "[e2e] waiting for server on port $PORT ..."
READY=0
for _ in $(seq 1 240); do
    if [ -f lingcat_data/key/public ]; then
        READY=1
        break
    fi
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
        echo "[e2e] server exited unexpectedly:"
        tail -40 server.log
        exit 1
    fi
    sleep 0.5
done

if [ "$READY" != "1" ]; then
    echo "[e2e] server startup timed out:"
    tail -40 server.log
    exit 1
fi

PUBLIC_KEY="$(od -An -v -tx1 lingcat_data/key/public | tr -d ' \n')"
echo "[e2e] server public key: $PUBLIC_KEY"

cd "$REPO_ROOT"
dotnet run --project desktop_core_tests/LingCat.Client.Interop.csproj -- \
    e2e "ws://127.0.0.1:$PORT" "http://127.0.0.1:$PORT" "$PUBLIC_KEY"
