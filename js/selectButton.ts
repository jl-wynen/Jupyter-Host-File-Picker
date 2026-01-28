import { button } from "./components.ts";
import { FileInfo } from "./comm.ts";

export class SelectButton extends EventTarget {
    readonly element: HTMLButtonElement;

    constructor() {
        super();
        this.element = button("Select", "Select file", (event: MouseEvent) => {
            event.stopPropagation();
            this.click();
        });
        this.element.classList.add("jphf-select-button");
        this.disable();
    }

    onFileMarked(fileInfo: FileInfo[]) {
        if (fileInfo.length === 1) {
            this.enable();
            if (fileInfo[0].type === "folder") {
                this.element.textContent = "Open";
            } else {
                this.element.textContent = "Select";
            }
        } else {
            this.element.textContent = "Select";
            this.disable();
        }
    }

    private click() {
        this.dispatchEvent(new MouseEvent("click", { bubbles: false }));
    }

    private disable() {
        this.element.disabled = true;
    }

    private enable() {
        this.element.disabled = false;
    }
}
