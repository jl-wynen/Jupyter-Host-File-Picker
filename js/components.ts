import { LabIcon } from "@jupyterlab/ui-components";

/**
 * Create a button with text.
 * @param label Text for the button.
 * @param title Tooltip and aria label for the button.
 * @param callback Callback to be invoked when the button is clicked.
 */
export function button(
    label: string,
    title: string,
    callback: (this: HTMLButtonElement, ev: PointerEvent) => any,
): HTMLButtonElement {
    const button = document.createElement("button");
    button.textContent = label;
    button.classList.add("jphf-button");
    button.classList.add("jupyter-button");
    button.setAttribute("aria-label", title);
    button.title = title;
    button.addEventListener("click", callback);
    return button;
}

/**
 * Create a button with an icon.
 * @param icon LabIcon for the button.
 * @param title Tooltip and aria label for the button.
 * @param callback Callback to be invoked when the button is clicked.
 */
export function iconButton(
    icon: LabIcon,
    title: string,
    callback: (this: HTMLButtonElement, ev: PointerEvent) => any,
): HTMLButtonElement {
    const button = document.createElement("button");
    button.classList.add("jphf-icon-button");
    icon.element({ container: button });
    button.setAttribute("aria-label", title);
    button.title = title;
    button.addEventListener("click", callback);
    return button;
}

/**
 * Create a toggle button with an icon.
 * @param icon LabIcon for the button.
 * @param title Tooltip and aria label for the button.
 * @param callback Callback to be invoked when the button is toggled.
 */
export function toggleButton(
    icon: LabIcon,
    title: string,
    callback: (this: HTMLInputElement, ev: Event) => any,
): [HTMLLabelElement, HTMLInputElement] {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.classList.add("jphf-toggle-button-input");
    input.setAttribute("aria-label", title);
    input.addEventListener("change", callback);

    const iconSpan = document.createElement("span");
    icon.element({ container: iconSpan });
    iconSpan.classList.add("jphf-toggle-button-icon");

    const label = document.createElement("label");
    label.classList.add("jphf-toggle-button");
    label.title = title;
    label.append(input, iconSpan);
    return [label, input];
}
