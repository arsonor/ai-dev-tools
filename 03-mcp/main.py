import os
import requests
from fastmcp import FastMCP
from search import load_docs_from_zip, create_index, search

mcp = FastMCP("Context7 Clone")

# Registry of loaded zip files and their search indexes
# Key: zip file path (normalized), Value: {"index": Index, "doc_count": int}
loaded_indexes: dict = {}


def fetch_page_content(url: str) -> str:
    """
    Fetch the content of a web page and return it as markdown.

    Uses Jina Reader to convert any web page to clean markdown format.

    Args:
        url: The URL of the web page to fetch (e.g., https://example.com)

    Returns:
        The page content in markdown format
    """
    jina_url = f"https://r.jina.ai/{url}"
    response = requests.get(jina_url)
    response.raise_for_status()
    return response.text


@mcp.tool
def fetch_page(url: str) -> str:
    """
    Fetch the content of a web page and return it as markdown.

    Uses Jina Reader to convert any web page to clean markdown format.

    Args:
        url: The URL of the web page to fetch (e.g., https://example.com)

    Returns:
        The page content in markdown format
    """
    return fetch_page_content(url)


def _normalize_path(zip_path: str) -> str:
    """Normalize a zip file path for consistent lookup."""
    return os.path.normpath(os.path.abspath(zip_path))


def _load_zip_index(zip_path: str) -> dict:
    """Load a zip file and create its search index if not already loaded."""
    normalized_path = _normalize_path(zip_path)

    if normalized_path not in loaded_indexes:
        if not os.path.exists(normalized_path):
            raise FileNotFoundError(f"Zip file not found: {zip_path}")

        docs = load_docs_from_zip(normalized_path)
        index = create_index(docs)
        loaded_indexes[normalized_path] = {
            "index": index,
            "doc_count": len(docs)
        }

    return loaded_indexes[normalized_path]


@mcp.tool
def load_zip(zip_path: str) -> str:
    """
    Load a zip file containing documentation for searching.

    The zip file should contain markdown (.md) or MDX (.mdx) files.
    Once loaded, you can search the documentation using search_docs.

    Args:
        zip_path: Path to the zip file to load

    Returns:
        A message indicating how many documents were loaded
    """
    try:
        info = _load_zip_index(zip_path)
        normalized_path = _normalize_path(zip_path)
        return f"Loaded {info['doc_count']} documents from {normalized_path}"
    except FileNotFoundError as e:
        return str(e)
    except Exception as e:
        return f"Error loading zip file: {e}"


@mcp.tool
def list_loaded_zips() -> str:
    """
    List all currently loaded zip files.

    Returns:
        A list of loaded zip files with their document counts
    """
    if not loaded_indexes:
        return "No zip files are currently loaded. Use load_zip to load a documentation archive."

    lines = ["Loaded zip files:"]
    for path, info in loaded_indexes.items():
        lines.append(f"  - {path} ({info['doc_count']} documents)")
    return "\n".join(lines)


@mcp.tool
def search_docs(query: str, zip_path: str) -> str:
    """
    Search documentation in a zip file for relevant information.

    The zip file will be automatically loaded if not already loaded.

    Args:
        query: The search query to find relevant documentation
        zip_path: Path to the zip file to search

    Returns:
        The top 5 most relevant documentation sections with filenames and content
    """
    try:
        info = _load_zip_index(zip_path)
    except FileNotFoundError as e:
        return str(e)
    except Exception as e:
        return f"Error loading zip file: {e}"

    results = search(info["index"], query, num_results=5)

    if not results:
        return f"No results found for '{query}'"

    output = []
    for i, result in enumerate(results, 1):
        output.append(f"## {i}. {result['filename']}\n\n{result['content']}")

    return "\n\n---\n\n".join(output)


if __name__ == "__main__":
    mcp.run()
