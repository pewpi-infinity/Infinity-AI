"""Minimal orchestrator agent for autonomous multi-repository workflows."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path
from typing import Any

from .memory_layer import SharedMemoryLayer

SAFE_PACKAGE_PATTERN = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9._-]*$")


class OrchestratorAgent:
    """Coordinates tasks, package discovery, and memory updates across repos."""

    PACKAGE_HINTS = {
        "scrape": ["firecrawl-py", "beautifulsoup4", "playwright"],
        "memory": ["qdrant-client", "chromadb", "mem0ai"],
        "agent": ["agno", "langchain", "autogen"],
        "docs": ["mkdocs", "pydantic", "sphinx"],
        "security": ["bandit", "safety", "pip-audit"],
        "model": ["transformers", "sentence-transformers", "huggingface-hub"],
    }

    def __init__(self, repos_root: str | Path, memory_layer: SharedMemoryLayer | None = None) -> None:
        self.repos_root = Path(repos_root)
        self.memory_layer = memory_layer or SharedMemoryLayer()

    def scan_repositories(self) -> list[str]:
        repos = []
        for child in self.repos_root.iterdir():
            if child.is_dir() and (child / ".git").exists():
                repos.append(child.name)
        return sorted(repos)

    def derive_subgoals(self, goal: str) -> list[str]:
        chunks = [part.strip() for part in re.split(r"[,\n]| and ", goal) if part.strip()]
        if chunks:
            return chunks
        return [goal.strip()] if goal.strip() else []

    def set_subgoals(self, goal: str) -> list[str]:
        """Backward-compatible alias for derive_subgoals."""
        return self.derive_subgoals(goal)

    def discover_python_packages(self, task_description: str, limit: int = 5) -> list[str]:
        task_lower = task_description.lower()
        packages: list[str] = []

        for keyword, candidates in self.PACKAGE_HINTS.items():
            if keyword in task_lower:
                packages.extend(candidates)

        if not packages:
            packages = ["requests", "pydantic"]

        deduped = list(dict.fromkeys(packages))
        return deduped[:limit]

    def plan_install_actions(self, repo_name: str, packages: list[str]) -> list[dict[str, str]]:
        return [
            {
                "repo": repo_name,
                "package": package,
                "command": f"{sys.executable} -m pip install {package}",
            }
            for package in packages
        ]

    def execute_install(self, package: str, repo_path: str | Path | None = None) -> subprocess.CompletedProcess[str]:
        if not SAFE_PACKAGE_PATTERN.match(package):
            raise ValueError(f"Unsafe package name: {package}")

        cwd = Path(repo_path) if repo_path else self.repos_root
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", package],
            cwd=cwd,
            capture_output=True,
            text=True,
            check=False,
        )
        self.memory_layer.store_memory(
            key=f"install::{package}",
            content=f"pip install exited with {result.returncode}",
            metadata={"stdout": result.stdout[-500:], "stderr": result.stderr[-500:]},
        )
        return result

    def orchestrate(self, goal: str) -> dict[str, Any]:
        repos = self.scan_repositories()
        subgoals = self.derive_subgoals(goal)

        plan: list[dict[str, Any]] = []
        for subgoal in subgoals:
            packages = self.discover_python_packages(subgoal)
            repo = repos[0] if repos else self.repos_root.name
            actions = self.plan_install_actions(repo, packages)
            plan.append({"subgoal": subgoal, "repo": repo, "actions": actions})
            self.memory_layer.store_memory(
                key=f"plan::{subgoal}",
                content=f"Planned {len(actions)} package actions for {repo}",
                metadata={"packages": packages},
            )

        return {"repos": repos, "subgoals": subgoals, "plan": plan}
