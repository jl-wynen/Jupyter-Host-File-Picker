# Jupyter Host File Picker

Jupyter widget for picking files on the host machine.

This widget allows users to select files from the machine that Jupyter is running on.
This can be the user's own machine in the case of a local Jupyter session, or it can
be a remote system when using Jupyter Hub.
In contrast, [ipywidgets.FileUpload](https://ipywidgets.readthedocs.io/en/latest/examples/Widget%20List.html#file-upload)
can only select files on the user machine.

## Installation

Install with pip:

```sh
python -m pip install jupyter_host_file_picker
```

or with [uv](https://docs.astral.sh/uv/):

```sh
uv add jupyter_host_file_picker
```

## Usage

See the [example notebook](example.ipynb) for a complete usage example.

The `HostFilePicker` class is a dialog with a file browser on the host machine.
You can create and display a `HostFilePicker` just like any other
[Jupyter widget](https://ipywidgets.readthedocs.io/en/latest/index.html):

```python
from jupyter_host_file_picker import HostFilePicker

picker = HostFilePicker()
# At the end of a cell:
picker
```

In the dialog, navigate folders by double-clicking on a folder
or by single-clicking and using the 'Open' button.
Similarly, select a file by double-clicking or by using the 'Select' button.

### Accessing the selected file

The selected file path is stored in

```python
picker.selected
```

This attribute is a list of `Path` objects.

> [!NOTE]
> Displaying the file picker will not block the Python kernel.
> So the `selected` list is empty until the user selects a file.

### Callback

Alternatively to the `selected` attribute, you can register an observer function
that will be called whenever the user selects a file:

```python
def print_selected(change):
    print("Selected file", change["new"])


picker.observe(print_selected, names="selected")
```

Note that this will only print to the Jupyter log console.

### Example with button and text field

Here is a more extensive example that uses a button to open the dialog
and a text field to display the selected file:

```python
import os
from pathlib import Path
from typing import Any

from IPython.display import display
from ipywidgets import Button, HBox, Layout, Output, Text
from jupyter_host_file_picker import HostFilePicker


selected_text = Text(layout=Layout(width="100%"))
browse_button = Button(description="Browse", icon="folder-open")
dialog_output = Output(layout=Layout(display="none"))


def sync_selected(change: dict[str, Any]) -> None:
    # Insert the selected path into the text field.
    selected: list[Path] = change["new"]
    if selected:
        path = selected[0]  # For now, there always is only one path.
        selected_text.value = os.fspath(path)


def browse_files(_: Button) -> None:
    # Open a dialog when the button is clicked.
    with dialog_output:  # Use the Output widget as a display context.
        dialog_output.clear_output()  # Remove old dialog, if any.
        picker = HostFilePicker()
        picker.observe(sync_selected, names="selected")
        display(picker)


browse_button.on_click(browse_files)

HBox([selected_text, browse_button, dialog_output])
```

We open the dialog from a callback of the button.
This callback does not have a display context,
and so we cannot simply show the dialog using `display(picker)`.
Instead, we use a dedicated `Output` widget to provide the necessary display context.
(This widget hat `Layout(display="none")` because it does not need to be visible itself;
it only provides access to the HTML document.)

## Development

### Requirements

Install the following:

- [npm](https://www.npmjs.com/)
- [uv](https://docs.astral.sh/uv/):

These tools manage all dependencies and build the package.

### Run development build

The first time you clone the repository, install JavaScript dependencies using

```shell
npm install
```

Run the following to build the TypeScript code.
This will automatically rebuild after any changes in the `js` folder.

```shell
npm run dev
```

Then, launch Jupyter with the example notebook:

```shell
uv run jupyter lab example.ipynb
```

Uncomment the first code cell to enable hot-reloading of JavaScript and CSS code.
If you make changes to the Python code, you need to restart the kernel.

### Make a release

To make a release, create a new release on GitHub and select a tag name according to
the calendar versioning scheme.
GitHub actions will do the rest; you only have to approve the deployment to PyPI.
