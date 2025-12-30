import requests
from fastmcp import FastMCP
from search import load_docs_from_zip, create_index, search

mcp = FastMCP("Context7 Clone")

# Initialize the search index at startup
docs = load_docs_from_zip("G:/Users/Martin/GITHUB/ai-dev-tools/03-mcp/fastmcp.zip")
search_index = create_index(docs)


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


@mcp.tool
def search_docs(query: str) -> str:
    """
    Search the FastMCP documentation for relevant information.

    Args:
        query: The search query to find relevant documentation

    Returns:
        The top 5 most relevant documentation sections with filenames and content
    """
    results = search(search_index, query, num_results=5)

    output = []
    for i, result in enumerate(results, 1):
        output.append(f"## {i}. {result['filename']}\n\n{result['content']}")

    return "\n\n---\n\n".join(output)


if __name__ == "__main__":
    mcp.run()
