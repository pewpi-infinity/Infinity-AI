# Infinity-AI

Minimal foundation for a backend-less "transformer of repositories":

- `infinity_ai/memory_layer.py`: persistent shared memory layer with:
  - `store_memory(key, content, metadata)`
  - `retrieve_context(query)`
  - `resolve_conflicts()`
- `infinity_ai/mcp_server.py`: JSON-line MCP-style server exposing memory functions.
- `infinity_ai/orchestrator.py`: orchestrator agent that scans repos, creates subgoals, discovers package candidates, and plans/install actions.

Run tests:

```bash
python -m unittest discover -s tests -v
```
