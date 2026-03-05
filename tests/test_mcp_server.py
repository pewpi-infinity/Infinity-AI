import io
import json
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch

from infinity_ai.mcp_server import MemoryMCPServer
from infinity_ai.memory_layer import SharedMemoryLayer


class MemoryMCPServerTests(unittest.TestCase):
    def test_handle_request_store_and_retrieve(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            server = MemoryMCPServer(SharedMemoryLayer(Path(tmp_dir, ".mem")))
            store_response = server.handle_request(
                {
                    "method": "store_memory",
                    "params": {"key": "pkg", "content": "Use qdrant", "metadata": {"repo": "A"}},
                }
            )
            self.assertTrue(store_response["ok"])
            self.assertEqual(store_response["result"]["key"], "pkg")

            fetch_response = server.handle_request(
                {"method": "retrieve_context", "params": {"query": "qdrant", "limit": 1}}
            )
            self.assertTrue(fetch_response["ok"])
            self.assertEqual(len(fetch_response["result"]), 1)

    def test_serve_stdio_processes_json_lines(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            server = MemoryMCPServer(SharedMemoryLayer(Path(tmp_dir, ".mem")))
            fake_input = io.StringIO(
                json.dumps(
                    {
                        "method": "store_memory",
                        "params": {"key": "goal", "content": "Add docs", "metadata": {}},
                    }
                )
                + "\n"
                + json.dumps({"method": "retrieve_context", "params": {"query": "docs"}})
                + "\n"
            )
            fake_output = io.StringIO()

            with patch("sys.stdin", fake_input), redirect_stdout(fake_output):
                server.serve_stdio()

            lines = [line for line in fake_output.getvalue().splitlines() if line.strip()]
            self.assertEqual(len(lines), 2)
            self.assertTrue(json.loads(lines[0])["ok"])
            self.assertTrue(json.loads(lines[1])["ok"])


if __name__ == "__main__":
    unittest.main()

