import mimetypes
import os
from datetime import datetime
from pathlib import Path


def inspect_file(path: Path) -> dict[str, str | int | None] | None:
    """Return a dict describing a file, or None if the file does not exist."""
    try:
        stat = path.stat()
    except FileNotFoundError:
        return None

    size = None if path.is_dir() else stat.st_size
    return {
        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),  # noqa: DTZ006
        "name": path.name,
        "path": os.fspath(path),
        "size": size,
        "type": _deduce_file_type(path),
    }


_KNOWN_MIMETYPES = {
    "application/json": "json",
    "application/pdf": "pdf",
    "text/markdown": "markdown",
    "text/csv": "spreadsheet",
    "text/tab-separated-values": "spreadsheet",
    "text/x-python": "python",
}


def _deduce_file_type(path: Path) -> str:
    """Deduce the file type from the mimetype and extension.

    The returned type string matches the types recognized by the TypeScript code.
    """
    if path.is_dir():
        return "folder"

    mimetype = mimetypes.guess_type(path)[0]
    try:
        return _KNOWN_MIMETYPES[mimetype]  # type: ignore[index]
    except KeyError:
        pass
    if mimetype is not None:
        if mimetype.startswith("image/"):
            return "image"
        if mimetype.startswith("video/"):
            return "video"

    # Files without a mimetype known to Python:
    match path.suffix.lower():
        case ".ipynb":
            return "ipynb"
        case ".yaml" | ".yml":
            return "yaml"
        case ".pyi":
            return "python"
        case ".hdf" | ".hdf5" | ".h5":
            return "hdf"

    return "file"
