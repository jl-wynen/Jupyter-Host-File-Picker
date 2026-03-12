export function setLatestPath(path: string) {
    localStorage.setItem("@jphf/latest-path", path);
}

export function getLatestPath(): string | null {
    return localStorage.getItem("@jphf/latest-path");
}

export function setShowHidden(showHidden: boolean) {
    localStorage.setItem("@jphf/show-hidden", showHidden.toString());
}

export function getShowHidden(): boolean | null {
    const stored = localStorage.getItem("@jphf/show-hidden");
    return stored === null ? null : stored === "true";
}
