export class PathState {
    private _current: string;
    private _currentSegments: string[];

    constructor(current: string, currentSegments: string[]) {
        this._current = current;
        this._currentSegments = currentSegments;
    }

    get current() {
        return this._current;
    }

    insertNew(path: string, segments: string[]) {
        this._current = path;
        this._currentSegments = segments;
    }
}
