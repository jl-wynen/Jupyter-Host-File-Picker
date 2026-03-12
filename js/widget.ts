import type { AnyModel, RenderProps } from "@anywidget/types";
import "./widget.css";
import { FileInfo, ResListDirPayload, BackendComm } from "./comm.ts";
import { FolderView, FileMarkedEvent, FileSelectedEvent } from "./folderView.ts";
import { button, toggleButton, iconButton } from "./components.ts";
import {
    closeIcon,
    workingDirIcon,
    circleArrowIcon,
    homeIcon,
    showHiddenIcon,
    upIcon,
} from "./icons.ts";
import { SelectButton } from "./selectButton.ts";
import { makeDraggable, makeResizable } from "./windowing.ts";
import { PathView } from "./path.ts";
import { getLatestPath, getShowHidden, setShowHidden } from "./storage.ts";

interface WidgetModel {
    _initialPath: string | null;
    _pathSep: string;
    _selected: string[];
    _remember: boolean;
}

function render({ model, el }: RenderProps<WidgetModel>) {
    const comm = new BackendComm(model);

    el.classList.add("jupyter-host-file-picker");
    el.style.position = "relative";
    el.style.display = "none";

    const dialog = document.createElement("dialog");
    dialog.className = "jphf-dialog";

    const [header, pathView, showHiddenToggle] = renderHeader(dialog, comm, model);
    dialog.appendChild(header);

    const content = document.createElement("div");
    content.className = "jphf-dialog-content";
    const folderView = new FolderView();
    content.appendChild(folderView.element);

    function selectFiles(fileInfos: FileInfo[]) {
        // TODO handle multiple files
        const fileInfo = fileInfos[0];
        if (fileInfo.type === "folder") {
            // Set early to update before possibly slow response comes back:
            pathView.setToProspective(fileInfo.path);
            folderView.showLoading();
            comm.sendReqListDir({
                path: fileInfo.path,
                showHidden: showHiddenToggle.checked,
            });
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
        if (payload.isFile) {
            selectFiles(payload.files);
        } else {
            // TODO check folder path to make sure we get the message for the correct folder
            pathView.setTo(payload.path);
            folderView.populate(payload.files);
        }
    });
    folderView.showLoading();
    listInitialDir(comm, model);

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
    dialog.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            dialog.close();
        }
    });

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
    model: AnyModel<WidgetModel>,
): [HTMLElement, PathView, HTMLInputElement] {
    const pathView = new PathView(
        model.get("_initialPath") || ".",
        model.get("_pathSep"),
        model.get("_remember"),
    );
    pathView.element.autofocus = true;

    const header = document.createElement("header");
    header.classList.add("jphf-nav-bar");

    const [showHiddenElement, showHiddenToggle] = toggleButton(
        showHiddenIcon,
        "Show hidden files",
        () => {
            if (model.get("_remember")) {
                setShowHidden(showHiddenToggle.checked);
            }
            refreshButton.click();
        },
    );
    if (getShowHidden()) {
        showHiddenToggle.checked = true;
    }

    header.appendChild(
        iconButton(upIcon, "Parent folder", () => {
            pathView.setToParentProspective();
            comm.sendReqListParent({
                path: pathView.current,
                showHidden: showHiddenToggle.checked,
            });
        }),
    );

    header.appendChild(
        iconButton(workingDirIcon, "Current working directory", () => {
            comm.sendReqListCwd({ showHidden: showHiddenToggle.checked });
        }),
    );

    header.appendChild(
        iconButton(homeIcon, "Home", () => {
            comm.sendReqListHome({ showHidden: showHiddenToggle.checked });
        }),
    );

    const refreshButton = iconButton(circleArrowIcon, "Refresh", () => {
        comm.sendReqListDir({
            path: pathView.current,
            showHidden: showHiddenToggle.checked,
        });
    });
    header.appendChild(refreshButton);

    pathView.onInput((path: string) =>
        comm.sendReqListDir({ path, showHidden: showHiddenToggle.checked }),
    );
    // Do not move the window from the input element:
    pathView.element.addEventListener("mousedown", (e: MouseEvent) =>
        e.stopPropagation(),
    );
    header.appendChild(pathView.element);

    header.appendChild(showHiddenElement);

    const closeButton = iconButton(closeIcon, "Close the file picker", () => {
        dialog.close();
    });
    closeButton.classList.add("jphf-close-button");
    header.appendChild(closeButton);

    return [header, pathView, showHiddenToggle];
}

function renderFooter(dialog: HTMLDialogElement): [HTMLElement, SelectButton] {
    const footer = document.createElement("footer");
    footer.classList.add("jphf-footer");

    footer.append(button("Cancel", "Cancel", () => dialog.close()));
    const selectButton = new SelectButton();
    footer.append(selectButton.element);

    return [footer, selectButton];
}

function listInitialDir(comm: BackendComm, model: AnyModel<WidgetModel>) {
    // Make sure that we always have a valid path to list.
    // CWD should be a good fallback.
    const path = model.get("_initialPath") || getLatestPath() || ".";
    comm.sendReqListDirWithFallback({ path, showHidden: getShowHidden() ?? false });
}

export default { render };
