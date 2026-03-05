"""Lightweight JSON-line MCP-style server for the shared memory layer."""

from __future__ import annotations

import json
import sys
from dataclasses import asdict
from typing import Any

from .memory_layer import SharedMemoryLayer


class MemoryMCPServer:
    def __init__(self, memory_layer: SharedMemoryLayer | None = None) -> None:
        self.memory_layer = memory_layer or SharedMemoryLayer()

    def handle_request(self, request: dict[str, Any]) -> dict[str, Any]:
        method = request.get("method")
        params = request.get("params", {})

        if method == "store_memory":
            record = self.memory_layer.store_memory(
                key=params["key"],
                content=params["content"],
                metadata=params.get("metadata"),
            )
            return {"ok": True, "result": asdict(record)}

        if method == "retrieve_context":
            return {
                "ok": True,
                "result": self.memory_layer.retrieve_context(
                    query=params["query"],
                    limit=params.get("limit", 5),
                ),
            }

        if method == "resolve_conflicts":
            return {"ok": True, "result": self.memory_layer.resolve_conflicts()}

        return {"ok": False, "error": f"Unknown method: {method}"}

    def serve_stdio(self) -> None:
        for line in sys.stdin:
            payload = line.strip()
            if not payload:
                continue
            try:
                request = json.loads(payload)
                response = self.handle_request(request)
            except (json.JSONDecodeError, KeyError, ValueError, TypeError) as exc:
                response = {"ok": False, "error": f"{type(exc).__name__}: {exc}"}
            except Exception as exc:
                response = {"ok": False, "error": f"Unhandled {type(exc).__name__}: {exc}"}
            print(json.dumps(response), flush=True)


if __name__ == "__main__":
    MemoryMCPServer().serve_stdio()
