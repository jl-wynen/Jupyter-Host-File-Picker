"""Widget for selecting files on the Jupyter host."""

import importlib.metadata
import os
import pathlib
from pathlib import Path
from typing import Any

import anywidget
import traitlets

from ._filesystem import inspect_file

try:
    __version__ = importlib.metadata.version("jupyter_host_file_picker")
except importlib.metadata.PackageNotFoundError:
    __version__ = "unknown"


class HostFilePicker(anywidget.AnyWidget):
    """Widget for selecting files on the Jupyter host."""

    _esm = pathlib.Path(__file__).parent / "static" / "widget.js"
    _css = pathlib.Path(__file__).parent / "static" / "widget.css"

    _dirPath = traitlets.Unicode().tag(sync=True)
    _selected = traitlets.List(trait=traitlets.Unicode()).tag(sync=True)

    selected = traitlets.List(trait=traitlets.Instance(Path)).tag()

    def __init__(self, initial_path: os.PathLike[str] | str = ".") -> None:
        initial_path = Path(initial_path).absolute()
        super().__init__(_dirPath=os.fspath(initial_path))

        self.on_msg(_handle_message)
        self.observe(self._sync_selected, names="_selected")

    def _sync_selected(self, change: dict[str, Any]) -> None:
        """Sync public ``selected`` to convert to Path objects."""
        self.selected = [Path(value) for value in change["new"]]


def _handle_message(
    widget: HostFilePicker, content: dict[str, Any], buffers: object
) -> None:
    if content.get("type") == "req:list-dir":
        path = Path(content["payload"]["path"])
        files = [res for p in path.iterdir() if (res := inspect_file(p))]
        widget.send(
            {
                "type": "res:list-dir",
                "payload": {
                    "path": os.fspath(path),
                    "segments": path.parts,
                    "files": files,
                },
            }
        )
