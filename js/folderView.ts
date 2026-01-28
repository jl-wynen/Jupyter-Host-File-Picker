import { FileInfo } from "./comm.ts";
import { iconForFileType } from "./icons.ts";
import { humanSize } from "./output.ts";

export class FolderView extends EventTarget {
    container: HTMLDivElement;
    private _loadingTimeout: number | null = null;

    constructor() {
        super();
        this.container = document.createElement("div");
    }

    get element() {
        return this.container;
    }

    showLoading() {
        this.clearLoading();
        this._loadingTimeout = setTimeout(() => {
            const loading = document.createElement("div");
            loading.className = "jphf-loading";
            loading.textContent = "Loading folder ...";
            this.container.replaceChildren(loading);
        }, 300);
    }

    private clearLoading() {
        if (this._loadingTimeout !== null) {
            clearTimeout(this._loadingTimeout);
            this._loadingTimeout = null;
        }
    }

    populate(files: FileInfo[]) {
        this.clearLoading();
        files.sort((a, b) => {
            // Folders first
            if (a.type === "folder" && b.type !== "folder") return -1;
            if (a.type !== "folder" && b.type === "folder") return 1;
            // then alphabetically
            return a.name.localeCompare(b.name);
        });

        const table = createFileTableElement();
        for (const info of files) {
            const row = table.insertRow();
            row.classList.add("jphf-file-list-item");

            const iconCell = row.insertCell();
            iconCell.classList.add("jphf-file-icon-cell");
            console.log(info.name, info.type);
            iconForFileType(info.type).element({
                container: iconCell,
                width: "1em",
                height: "1em",
            });

            const nameCell = row.insertCell();
            nameCell.textContent = info.name;
            nameCell.classList.add("jphf-file-name-cell");

            const sizeCell = row.insertCell();
            sizeCell.classList.add("jphf-file-size-cell");
            if (info.size !== null) {
                sizeCell.replaceChildren(humanSize(info.size));
            }

            const modifiedCell = row.insertCell();
            modifiedCell.classList.add("jphf-file-modified-cell");
            modifiedCell.textContent = info.modified;

            row.addEventListener("mousedown", (event: MouseEvent) => {
                if (event.detail > 1) {
                    // Do not select text on double-click
                    event.preventDefault();
                }
            });

            row.addEventListener("click", (event: MouseEvent) => {
                event.preventDefault();
                for (const row of table.querySelectorAll("tr")) {
                    row.ariaSelected = "false";
                }
                row.ariaSelected = "true";
            });

            row.addEventListener("dblclick", (event: MouseEvent) => {
                event.preventDefault();
                this.dispatchEvent(new FileSelectedEvent([info]));
            });
        }
        this.container.replaceChildren(table);
    }
}

export class FileSelectedEvent extends Event {
    constructor(public fileInfo: FileInfo[]) {
        super("file-selected");
    }
}

function createFileTableElement(): HTMLTableElement {
    const table = document.createElement("table");
    table.classList.add("jphf-file-table");

    const header = document.createElement("thead");
    const row = document.createElement("tr");

    const iconTh = document.createElement("th");
    iconTh.classList.add("jphf-file-icon-cell");
    row.appendChild(iconTh);

    const nameTh = document.createElement("th");
    nameTh.textContent = "Name";
    nameTh.classList.add("jphf-file-name-cell");
    row.appendChild(nameTh);

    const sizeTh = document.createElement("th");
    sizeTh.textContent = "Size";
    sizeTh.classList.add("jphf-file-size-cell");
    row.appendChild(sizeTh);

    const modifiedTh = document.createElement("th");
    modifiedTh.textContent = "Modified";
    modifiedTh.classList.add("jphf-file-modified-cell");
    row.appendChild(modifiedTh);

    header.appendChild(row);
    table.appendChild(header);

    const body = document.createElement("tbody");
    table.appendChild(body);

    return table;
}
