"""Search implementation using minsearch for fastmcp documentation."""

import zipfile
from minsearch import Index


def load_docs_from_zip(zip_path: str) -> list[dict]:
    """
    Load markdown and mdx files from a zip archive.

    Args:
        zip_path: Path to the zip file

    Returns:
        List of documents with 'filename' and 'content' fields
    """
    docs = []

    with zipfile.ZipFile(zip_path, 'r') as zf:
        for file_info in zf.infolist():
            # Skip directories
            if file_info.is_dir():
                continue

            # Only process .md and .mdx files
            if not (file_info.filename.endswith('.md') or file_info.filename.endswith('.mdx')):
                continue

            # Remove the first part of the path (e.g., "fastmcp-main/")
            filename = file_info.filename
            if '/' in filename:
                filename = '/'.join(filename.split('/')[1:])

            # Read the content
            content = zf.read(file_info).decode('utf-8')

            docs.append({
                'filename': filename,
                'content': content
            })

    return docs


def create_index(docs: list[dict]) -> Index:
    """
    Create a minsearch index from documents.

    Args:
        docs: List of documents with 'filename' and 'content' fields

    Returns:
        Fitted minsearch Index
    """
    index = Index(
        text_fields=['content'],
        keyword_fields=['filename']
    )
    index.fit(docs)
    return index


def search(index: Index, query: str, num_results: int = 5) -> list[dict]:
    """
    Search the index for relevant documents.

    Args:
        index: The minsearch Index
        query: Search query string
        num_results: Number of results to return (default: 5)

    Returns:
        List of matching documents
    """
    return index.search(query, num_results=num_results)


if __name__ == "__main__":
    # Load documents from the zip file
    print("Loading documents from zip...")
    docs = load_docs_from_zip("fastmcp.zip")
    print(f"Loaded {len(docs)} markdown files")

    # Print some filenames to verify path cleaning
    print("\nSample filenames:")
    for doc in docs[:5]:
        print(f"  - {doc['filename']}")

    # Create the index
    print("\nCreating search index...")
    index = create_index(docs)

    # Test search with "demo"
    print("\nSearching for 'demo'...")
    results = search(index, "demo")

    print(f"\nTop {len(results)} results:")
    for i, result in enumerate(results, 1):
        print(f"{i}. {result['filename']}")
        # Show first 200 chars of content
        preview = result['content'][:200].replace('\n', ' ')
        print(f"   Preview: {preview}...")
        print()
