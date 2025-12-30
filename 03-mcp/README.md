# Context7 Clone - MCP Documentation Server

A Model Context Protocol (MCP) server that provides documentation search and web page fetching capabilities for AI assistants like Claude Desktop.

## Features

### Tools

1. **`fetch_page`** - Fetch any web page as clean markdown
   - Uses [Jina Reader](https://jina.ai/reader/) to convert web pages to markdown
   - Simply prepends `r.jina.ai` to any URL for conversion

2. **`search_docs`** - Search FastMCP documentation
   - Returns the top 5 most relevant documentation sections
   - Uses [minsearch](https://github.com/alexeygrigorev/minsearch) for TF-IDF based text search
   - Indexes 266 markdown files from FastMCP documentation

## Installation

### Prerequisites

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) package manager

### Setup

```bash
# Clone or navigate to the project
cd 03-mcp

# Install dependencies
uv sync
```

### Download FastMCP Documentation

The search functionality requires the FastMCP documentation. Download it:

```bash
uv run python -c "import requests; r = requests.get('https://github.com/jlowin/fastmcp/archive/refs/heads/main.zip'); open('fastmcp.zip', 'wb').write(r.content)"
```

## Usage

### Running the MCP Server

```bash
uv run python main.py
```

### Integration with Claude Desktop

Add the following to your Claude Desktop configuration file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "context7-clone": {
      "command": "uv",
      "args": ["--directory", "/path/to/03-mcp", "run", "python", "main.py"]
    }
  }
}
```

Replace `/path/to/03-mcp` with the actual path to this project.

After updating the config, restart Claude Desktop to load the new MCP server.

## Project Structure

```
03-mcp/
├── main.py           # MCP server with fetch_page and search_docs tools
├── search.py         # Search functionality using minsearch
├── test.py           # Test script for fetch_page
├── fastmcp.zip       # FastMCP documentation (downloaded separately)
├── pyproject.toml    # Project dependencies
└── README.md         # This file
```

## Dependencies

- **fastmcp** - Framework for building MCP servers
- **requests** - HTTP library for fetching web pages
- **minsearch** - Minimalistic text search engine using TF-IDF

## How It Works

### Web Page Fetching

The `fetch_page` tool uses Jina Reader's free API:

```python
jina_url = f"https://r.jina.ai/{url}"
response = requests.get(jina_url)
return response.text
```

### Documentation Search

1. **Loading**: Extracts `.md` and `.mdx` files from the FastMCP zip archive
2. **Indexing**: Creates a TF-IDF index using minsearch with content as the text field
3. **Searching**: Returns top 5 most relevant documents based on cosine similarity

```python
from minsearch import Index

index = Index(
    text_fields=['content'],
    keyword_fields=['filename']
)
index.fit(docs)
results = index.search(query, num_results=5)
```

## Example Queries

Once integrated with Claude Desktop, you can ask:

- "Use fetch_page to get the content of https://example.com"
- "Use search_docs to find information about creating MCP tools"
- "Search the docs for how to handle authentication"

## License

MIT
