from pathlib import Path
import os
from datetime import datetime
import mimetypes


def inspect_file(path: Path) -> dict[str, str | int | None] | None:
    """Return a dict describing a file, or None if the file does not exist."""
    try:
        stat = path.stat()
    except FileNotFoundError:
        return None

    size = None if path.is_dir() else stat.st_size
    return {
        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
        "name": path.name,
        "path": os.fspath(path),
        "size": size,
        "type": _deduce_file_type(path),
    }


_KNOWN_MIMETYPES = {
    "application/json": "json",
    "text/markdown": "markdown",
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
        return _KNOWN_MIMETYPES[mimetype]
    except KeyError:
        pass
    if mimetype is not None and mimetype.startswith("image/"):
        return "image"

    # Files without a mimetype known to Python:
    match path.suffix.lower():
        case ".ipynb":
            return "ipynb"
        case ".yaml" | ".yml":
            return "yaml"
        case ".pyi":
            return "python"
        case "hdf" | "hdf5" | "h5":
            return "hdf"

    return "file"
