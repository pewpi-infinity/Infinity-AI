import tempfile
import unittest
from pathlib import Path

from infinity_ai.memory_layer import SharedMemoryLayer
from infinity_ai.orchestrator import OrchestratorAgent


class OrchestratorAgentTests(unittest.TestCase):
    def test_instantiation_uses_shared_memory_layer(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            memory = SharedMemoryLayer(Path(tmp_dir, ".mem"))
            orchestrator = OrchestratorAgent(tmp_dir, memory)
            self.assertIs(orchestrator.memory_layer, memory)

    def test_scan_repositories_detects_git_dirs(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            repo_a = Path(tmp_dir, "repo_a")
            repo_a.mkdir()
            Path(repo_a, ".git").mkdir()
            Path(tmp_dir, "not_repo").mkdir()

            orchestrator = OrchestratorAgent(tmp_dir, SharedMemoryLayer(Path(tmp_dir, ".mem")))
            self.assertEqual(orchestrator.scan_repositories(), ["repo_a"])

    def test_discovery_uses_task_hints(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            orchestrator = OrchestratorAgent(tmp_dir, SharedMemoryLayer(Path(tmp_dir, ".mem")))
            packages = orchestrator.discover_python_packages("Need security scan for agent", limit=10)
            self.assertIn("bandit", packages)
            self.assertIn("agno", packages)

    def test_orchestrate_builds_plan_and_stores_memory(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            repo_a = Path(tmp_dir, "repo_a")
            repo_a.mkdir()
            Path(repo_a, ".git").mkdir()
            memory = SharedMemoryLayer(Path(tmp_dir, ".mem"))
            orchestrator = OrchestratorAgent(tmp_dir, memory)

            result = orchestrator.orchestrate("build memory and docs")

            self.assertEqual(result["repos"], ["repo_a"])
            self.assertEqual(result["subgoals"], ["build memory", "docs"])
            self.assertEqual(len(result["plan"]), 2)
            self.assertGreaterEqual(memory.record_count, 2)

    def test_execute_install_rejects_unsafe_package_name(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            orchestrator = OrchestratorAgent(tmp_dir, SharedMemoryLayer(Path(tmp_dir, ".mem")))
            with self.assertRaises(ValueError):
                orchestrator.execute_install("requests;rm -rf /")


if __name__ == "__main__":
    unittest.main()
