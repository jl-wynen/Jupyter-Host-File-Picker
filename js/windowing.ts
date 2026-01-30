/**
 * Make an element draggable by dragging a trigger element.
 *
 * The trigger element must be positioned inside `element`.
 * @param element HTML element to drag.
 *                Must have `position: fixed`.
 * @param triggerElement HTML element that triggers dragging
 *                       when the user presses the mouse inside.
 * @returns A function to remove the event listeners.
 */
export function makeDraggable(
    element: HTMLElement,
    triggerElement: HTMLElement,
): () => void {
    let isDragging = false;

    // Mouse position when dragging is started:
    let startX = 0;
    let startY = 0;
    // Window position when dragging started:
    let startLeft = 0;
    let startTop = 0;

    // Minimum visible distance in all directions in pixels:
    const minVisible = 30;

    triggerElement.addEventListener("mousedown", (e) => {
        element.classList.add("jphf-dragging");
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const rect = element.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;

        e.preventDefault();
    });

    const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const rect = element.getBoundingClientRect();
        const triggerHeight = triggerElement.offsetHeight;

        // Compute the new top-left corner and ensure at least
        // some part of the trigger element is visible.
        const newLeft = clamp(
            startLeft + dx,
            -(rect.width - minVisible),
            viewportWidth - minVisible,
        );
        const newTop = clamp(
            startTop + dy,
            -(triggerHeight - minVisible),
            viewportHeight - minVisible,
        );

        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;
    };

    const onMouseUp = () => {
        element.classList.remove("jphf-dragging");
        isDragging = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    };
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max));
}
