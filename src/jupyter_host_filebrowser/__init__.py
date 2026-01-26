import importlib.metadata
import pathlib

import anywidget
import traitlets
from pathlib import Path
from datetime import datetime
import os

try:
    __version__ = importlib.metadata.version("jupyter_host_filebrowser")
except importlib.metadata.PackageNotFoundError:
    __version__ = "unknown"


class Widget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "static" / "widget.js"
    _css = pathlib.Path(__file__).parent / "static" / "widget.css"
    dirPath = traitlets.Unicode().tag(sync=True)


def make_widget(initial_path: os.PathLike[str] | str = "."):
    initial_path = Path(initial_path).absolute()
    widget = Widget(dirPath=os.fspath(initial_path))

    widget.on_msg(handle)

    return widget


def handle(widget, content, buffers):
    if content.get("type") == "req:list-dir":
        path = Path(content["payload"]["path"])
        files = [res for p in path.iterdir() if (res := inspect_file(p))]
        widget.send({"type": "res:list-dir", "payload": files})


def inspect_file(path: Path) -> dict[str, str | int | None] | None:
    try:
        stat = path.stat()
    except FileNotFoundError:
        return None

    base = {
        "path": os.fspath(path),
        "name": path.name,
        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
    }

    if path.is_dir():
        return {
            **base,
            "ext": "folder",
            "size": None,
        }

    return {
        **base,
        "ext": path.suffix,
        "size": stat.st_size,
    }
