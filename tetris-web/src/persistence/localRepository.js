export function getUsername() {
    return localStorage.getItem("username");
}

export function setUsername(name) {
    localStorage.setItem("username", name);
}

export function getLastGameLines() {
    return localStorage.getItem("lines");
}

export function setLastGameLines(lines) {
    localStorage.setItem("lines", lines);
}