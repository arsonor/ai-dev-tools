"""Test script for the fetch_page function."""

from main import fetch_page_content


def test_fetch_page():
    """Test fetching a web page using Jina Reader."""
    url = "https://datatalks.club"
    print(f"Fetching content from: {url}")
    print("-" * 50)

    content = fetch_page_content(url)

    # Print first 2000 characters to verify it works
    print(content[:2000])
    print("-" * 50)
    print(f"Total content length: {len(content)} characters")


if __name__ == "__main__":
    test_fetch_page()
