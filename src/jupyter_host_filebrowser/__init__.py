import importlib.metadata
import pathlib

import anywidget
import traitlets
from pathlib import Path
import os

try:
    __version__ = importlib.metadata.version("jupyter_host_filebrowser")
except importlib.metadata.PackageNotFoundError:
    __version__ = "unknown"


class Widget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "static" / "widget.js"
    _css = pathlib.Path(__file__).parent / "static" / "widget.css"
    dirPath = traitlets.Unicode().tag(sync=True)


def make_widget(initial_path:os.PathLike[str]|str = "."):
    initial_path = Path(initial_path).absolute()
    widget = Widget(dirPath=os.fspath(initial_path))

    widget.on_msg(handle)

    return widget

def handle(widget, content, buffers):
    if content.get("type") == "req:list-dir":
        path = Path(content["payload"]["path"])
        files = [os.fspath(p) for p in path.iterdir()]
        widget.send({"type":"res:list-dir", "payload":files})
