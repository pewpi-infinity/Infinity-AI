"""Shared memory layer with local persistence and MCP-friendly interfaces."""

from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


TOKEN_PATTERN = re.compile(r"[a-zA-Z0-9_]+")


def _tokenize(text: str) -> set[str]:
    return {token.lower() for token in TOKEN_PATTERN.findall(text)}


@dataclass
class MemoryRecord:
    key: str
    content: str
    metadata: dict[str, Any]
    created_at: str


class SharedMemoryLayer:
    """Persistent memory layer for multi-repository agents."""

    def __init__(self, storage_dir: str | Path = ".knowledge_vault") -> None:
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self.storage_path = self.storage_dir / "memories.json"
        self._records: list[MemoryRecord] = self._load()

    def _load(self) -> list[MemoryRecord]:
        if not self.storage_path.exists():
            return []
        with self.storage_path.open("r", encoding="utf-8") as handle:
            raw = json.load(handle)
        return [MemoryRecord(**entry) for entry in raw]

    def _save(self) -> None:
        with self.storage_path.open("w", encoding="utf-8") as handle:
            json.dump([asdict(record) for record in self._records], handle, indent=2)

    def store_memory(self, key: str, content: str, metadata: dict[str, Any] | None = None) -> MemoryRecord:
        """Save new code logic, package findings, and operational lessons."""
        record = MemoryRecord(
            key=key,
            content=content,
            metadata=metadata or {},
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        self._records.append(record)
        self._save()
        return record

    def retrieve_context(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        """Semantic retrieval using token overlap scoring."""
        query_tokens = _tokenize(query)
        scored: list[tuple[float, MemoryRecord]] = []

        for record in self._records:
            searchable = f"{record.key} {record.content} {json.dumps(record.metadata, sort_keys=True)}"
            record_tokens = _tokenize(searchable)
            if not record_tokens:
                continue
            overlap = len(query_tokens & record_tokens)
            if overlap == 0:
                continue
            score = overlap / max(len(query_tokens), 1)
            scored.append((score, record))

        scored.sort(key=lambda pair: pair[0], reverse=True)
        return [
            {
                "score": round(score, 4),
                "key": record.key,
                "content": record.content,
                "metadata": record.metadata,
                "created_at": record.created_at,
            }
            for score, record in scored[:limit]
        ]

    def resolve_conflicts(self) -> list[dict[str, Any]]:
        """
        Identify contradictory entries where the same key has multiple contents.
        Returns conflicts for downstream agentic consolidation loops.
        """
        grouped: dict[str, set[str]] = {}
        for record in self._records:
            grouped.setdefault(record.key, set()).add(record.content.strip())

        conflicts = []
        for key, variants in grouped.items():
            if len(variants) > 1:
                conflicts.append(
                    {
                        "key": key,
                        "variants": sorted(variants),
                        "status": "flagged_for_review",
                    }
                )
        return conflicts

    @property
    def record_count(self) -> int:
        return len(self._records)

