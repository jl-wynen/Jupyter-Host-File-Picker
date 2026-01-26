import {FileInfo} from "./comm.ts";
import {iconForExtension} from "./icons.ts";
import {humanSize} from "./output.ts";

export class FolderView {
    container: HTMLDivElement;

    constructor() {
        this.container = document.createElement("div");
    }

    get element() {
        return this.container;
    }

    populate(files: FileInfo[]) {
        files.sort((a, b) => {
            // Folders first
            if (b.ext === "folder" && a.ext !== "folder") return 1;
            // then alphabetically
            return a.name.localeCompare(b.name);
        });

        const table = createFileTableElement();
        for (const info of files) {
            const row = table.insertRow();
            row.classList.add("jphf-file-list-item");

            const iconCell = row.insertCell();
            iconForExtension(info.ext).element({container: iconCell});

            row.insertCell().textContent = info.name;
            if (info.size === null) {
                row.insertCell();
            } else {
                row.insertCell().replaceChildren(humanSize(info.size));
            }
            row.insertCell().textContent = info.modified;

            row.addEventListener("click", (event: MouseEvent) => {
                event.preventDefault();
                for (const row of table.querySelectorAll("tr")) {
                    row.ariaSelected = "false";
                }
                row.ariaSelected = "true";
            })
        }
        this.container.replaceChildren(table);
    }
}

function createFileTableElement(): HTMLTableElement {
    const table = document.createElement("table");
    table.classList.add("jphf-file-table");

    const header = document.createElement("thead");
    const row = document.createElement("tr");
    row.innerHTML = "<th></th><th>Name</th><th>Size</th><th>Modified</th>";
    header.appendChild(row);
    table.appendChild(header);

    const body = document.createElement("tbody");
    table.appendChild(body);

    return table;
}
