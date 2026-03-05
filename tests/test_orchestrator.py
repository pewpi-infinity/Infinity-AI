import tempfile
import unittest
from pathlib import Path

from infinity_ai.memory_layer import SharedMemoryLayer
from infinity_ai.orchestrator import OrchestratorAgent


class OrchestratorAgentTests(unittest.TestCase):
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
            packages = orchestrator.discover_python_packages("Need security scan for agent")
            self.assertIn("bandit", packages)
            self.assertIn("agno", packages)

    def test_execute_install_rejects_unsafe_package_name(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            orchestrator = OrchestratorAgent(tmp_dir, SharedMemoryLayer(Path(tmp_dir, ".mem")))
            with self.assertRaises(ValueError):
                orchestrator.execute_install("requests;rm -rf /")


if __name__ == "__main__":
    unittest.main()

