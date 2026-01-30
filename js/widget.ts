import type { RenderProps } from "@anywidget/types";
import "./widget.css";
import { FileInfo } from "./comm.ts";
import { FolderView, FileMarkedEvent, FileSelectedEvent } from "./folderView.ts";
import { button, iconButton } from "./components.ts";
import { backIcon, closeIcon, forwardIcon, upIcon } from "./icons.ts";
import { SelectButton } from "./selectButton.ts";
import { makeDraggable, makeResizable } from "./windowing.ts";

interface WidgetModel {
    _dirPath: string;
    _selected: string[];
}

function render({ model, el }: RenderProps<WidgetModel>) {
    el.classList.add("jupyter-host-file-picker");
    el.style.position = "relative";
    el.style.display = "none";

    const dialog = document.createElement("dialog");
    dialog.className = "jphf-dialog";

    const [header, pathInput] = renderHeader(dialog, model.get("_dirPath"));
    dialog.appendChild(header);

    const content = document.createElement("div");
    content.className = "jphf-dialog-content";
    const folderView = new FolderView();
    content.appendChild(folderView.element);

    function selectFiles(fileInfos: FileInfo[]) {
        // TODO handle multiple files
        const fileInfo = fileInfos[0];
        if (fileInfo.type === "folder") {
            model.set("_dirPath", fileInfo.path);
            pathInput.value = fileInfo.path;
            folderView.showLoading();
            model.send({ type: "req:list-dir", payload: { path: fileInfo.path } });
        } else {
            model.set("_selected", [fileInfo.path]);
            model.save_changes();
            dialog.close();
        }
    }

    folderView.addEventListener("file-selected", (e: Event) => {
        const event = e as FileSelectedEvent;
        selectFiles(event.fileInfo);
    });
    model.on("msg:custom", (message) => {
        // TODO check folder path to make sure we get the message for the correct folder
        if (message.type === "res:list-dir") {
            const fileList = message.payload as FileInfo[];
            folderView.populate(fileList);
        }
    });
    folderView.showLoading();
    model.send({ type: "req:list-dir", payload: { path: model.get("_dirPath") } });

    dialog.appendChild(content);

    const [footer, selectButton] = renderFooter(dialog);
    dialog.appendChild(footer);
    folderView.addEventListener("file-marked", (e: Event) => {
        const event = e as FileMarkedEvent;
        selectButton.onFileMarked(event.fileInfo);
    });
    selectButton.addEventListener("click", () => {
        selectFiles(folderView.selectedFiles);
    });

    const dragCleanup = makeDraggable(dialog, header);
    const resizeCleanup = makeResizable(dialog);

    document.body.appendChild(dialog);
    dialog.show();

    return () => {
        dialog.remove();
        dragCleanup();
        resizeCleanup();
    };
}

function renderHeader(
    dialog: HTMLDialogElement,
    currentPath: string,
): [HTMLElement, HTMLInputElement] {
    const header = document.createElement("header");
    header.classList.add("jphf-nav-bar");

    const backButton = iconButton(backIcon, "Previous folder", () => {});
    backButton.setAttribute("disabled", "");
    header.appendChild(backButton);
    const forwardButton = iconButton(forwardIcon, "Next folder", () => {});
    forwardButton.setAttribute("disabled", "");
    header.appendChild(forwardButton);
    header.appendChild(iconButton(upIcon, "Parent folder", () => {}));

    const path = document.createElement("input");
    path.type = "text";
    path.value = currentPath;
    path.setAttribute("autofocus", "");
    // Do not move the window from the input element:
    path.addEventListener("mousedown", (e: MouseEvent) => e.stopPropagation());
    header.appendChild(path);

    const closeButton = iconButton(closeIcon, "Close the file picker", () => {
        dialog.close();
    });
    closeButton.classList.add("jphf-close-button");
    header.appendChild(closeButton);

    return [header, path];
}

function renderFooter(dialog: HTMLDialogElement): [HTMLElement, SelectButton] {
    const footer = document.createElement("footer");
    footer.classList.add("jphf-footer");

    footer.append(button("Cancel", "Cancel", () => dialog.close()));
    const selectButton = new SelectButton();
    footer.append(selectButton.element);

    return [footer, selectButton];
}

export default { render };
