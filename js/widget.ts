import type { RenderProps } from "@anywidget/types";
import "./widget.css";
import { FileInfo, ResListDirPayload, BackendComm } from "./comm.ts";
import { FolderView, FileMarkedEvent, FileSelectedEvent } from "./folderView.ts";
import { button, iconButton } from "./components.ts";
import { backIcon, closeIcon, forwardIcon, upIcon } from "./icons.ts";
import { SelectButton } from "./selectButton.ts";
import { makeDraggable, makeResizable } from "./windowing.ts";
import { PathState } from "./path.ts";

interface WidgetModel {
    _initialPath: string;
    _initialSegments: string[];
    _selected: string[];
}

function render({ model, el }: RenderProps<WidgetModel>) {
    const comm = new BackendComm(model);
    const pathState = new PathState(
        model.get("_initialPath"),
        model.get("_initialSegments"),
    );

    el.classList.add("jupyter-host-file-picker");
    el.style.position = "relative";
    el.style.display = "none";

    const dialog = document.createElement("dialog");
    dialog.className = "jphf-dialog";

    const [header, pathInput] = renderHeader(dialog, comm, pathState);
    dialog.appendChild(header);

    const content = document.createElement("div");
    content.className = "jphf-dialog-content";
    const folderView = new FolderView();
    content.appendChild(folderView.element);

    function selectFiles(fileInfos: FileInfo[]) {
        // TODO handle multiple files
        const fileInfo = fileInfos[0];
        if (fileInfo.type === "folder") {
            pathInput.value = fileInfo.path;
            folderView.showLoading();
            comm.sendReqListDir({ path: fileInfo.path });
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
    comm.onResListDir((payload: ResListDirPayload) => {
        console.log("Received list dir response:", payload);
        // TODO check folder path to make sure we get the message for the correct folder
        pathInput.value = payload.path;
        pathState.insertNew(payload.path, payload.segments);
        folderView.populate(payload.files);
    });
    folderView.showLoading();
    comm.sendReqListDir({ path: pathState.current });

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
    comm: BackendComm,
    pathState: PathState,
): [HTMLElement, HTMLInputElement] {
    const header = document.createElement("header");
    header.classList.add("jphf-nav-bar");

    const backButton = iconButton(backIcon, "Previous folder", () => {});
    backButton.setAttribute("disabled", "");
    header.appendChild(backButton);
    const forwardButton = iconButton(forwardIcon, "Next folder", () => {});
    forwardButton.setAttribute("disabled", "");
    header.appendChild(forwardButton);
    header.appendChild(
        iconButton(upIcon, "Parent folder", () => {
            comm.sendReqListParent({ path: pathState.current });
        }),
    );

    const path = document.createElement("input");
    path.type = "text";
    path.value = pathState.current;
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
