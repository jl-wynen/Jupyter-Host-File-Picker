export class PathState {
    private _current: string;

    constructor(current: string) {
        this._current = current;
    }

    get current() {
        return this._current;
    }

    insertNew(path: string) {
        this._current = path;
    }
}

export class PathView {
    private readonly pathState: PathState;
    private readonly pathSep: string;
    private readonly el: HTMLInputElement;

    constructor(pathState: PathState, pathSep: string) {
        this.pathState = pathState;
        this.pathSep = pathSep;
        this.el = document.createElement("input");
        this.el.type = "text";
        this.el.value = pathState.current;
    }

    get element(): HTMLInputElement {
        return this.el;
    }

    setTo(path: string) {
        this.pathState.insertNew(path);
        this.el.value = path;
    }

    /** Set the displayed value to the given path.
     *
     * This does not add the path to the path state and history.
     * So this function should only be used for a quick display
     * update before the proper path is available.
     */
    setToProspective(path: string) {
        this.el.value = `${path}${this.pathSep}`;
    }

    /** Set the displayed value to the parent of the current path.
     *
     * This does not add the path to the path state and history.
     * So this function should only be used for a quick display
     * update before the proper path is available.
     */
    setToParentProspective() {
        let current = this.pathState.current;
        if (current.endsWith(this.pathSep)) {
            current = current.slice(0, -1);
        }
        const index = current.lastIndexOf(this.pathSep);
        if (index === -1) {
            this.el.value = "";
        } else {
            this.el.value = this.pathState.current.slice(0, index) + this.pathSep;
        }
    }

    onInput(callback: (path: string) => void) {
        this.el.addEventListener("keydown", (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                callback(this.el.value);
            }
        });
    }
}
