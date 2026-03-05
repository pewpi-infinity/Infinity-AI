import tempfile
import unittest
from pathlib import Path

from infinity_ai.memory_layer import SharedMemoryLayer


class SharedMemoryLayerTests(unittest.TestCase):
    def test_store_and_retrieve_context(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            memory = SharedMemoryLayer(storage_dir=tmp_dir)
            memory.store_memory("pkg", "Use qdrant for vector search", {"repo": "A"})
            memory.store_memory("docs", "Generate readme with mkdocs", {"repo": "B"})

            results = memory.retrieve_context("vector search qdrant", limit=1)
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]["key"], "pkg")
            self.assertGreater(results[0]["score"], 0)

    def test_resolve_conflicts_flags_variants(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            memory = SharedMemoryLayer(storage_dir=tmp_dir)
            memory.store_memory("dependency", "Use qdrant-client 1.0", {})
            memory.store_memory("dependency", "Use qdrant-client 2.0", {})

            conflicts = memory.resolve_conflicts()
            self.assertEqual(len(conflicts), 1)
            self.assertEqual(conflicts[0]["key"], "dependency")
            self.assertEqual(conflicts[0]["status"], "flagged_for_review")

    def test_data_persists_on_disk(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            memory = SharedMemoryLayer(storage_dir=tmp_dir)
            memory.store_memory("plan", "First build memory layer", {})

            reloaded = SharedMemoryLayer(storage_dir=tmp_dir)
            self.assertEqual(reloaded.record_count, 1)
            self.assertTrue(Path(tmp_dir, "memories.json").exists())


if __name__ == "__main__":
    unittest.main()

