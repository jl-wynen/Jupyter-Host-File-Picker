import type { RenderProps } from "@anywidget/types";
import "./widget.css";

interface WidgetModel {
}

function render({ model: _model, el }: RenderProps<WidgetModel>) {
	el.classList.add("jupyter_host_filebrowser");
	el.style.position = "relative";
	el.style.height = "500px";

	// State for dragging and resizing
	let isDragging = false;
	let isResizing = false;
	let currentResizer: string | null = null;
	let startX = 0;
	let startY = 0;
	let startLeft = 0;
	let startTop = 0;
	let startWidth = 0;
	let startHeight = 0;

	const dialog = document.createElement("dialog");
	dialog.className = "my-dialog";

	const header = document.createElement("div");
	header.className = "dialog-header";

	const title = document.createElement("span");
	title.textContent = "Draggable & Resizable Dialog";
	header.appendChild(title);

	const closeButton = document.createElement("button");
	closeButton.className = "close-button";
	closeButton.innerHTML = "&times;";
	header.appendChild(closeButton);

	const content = document.createElement("div");
	content.className = "dialog-content";
	content.textContent = "This is a dialog that you can drag by the header and resize from any border or corner.";

	dialog.appendChild(header);
	dialog.appendChild(content);

	// Add resizers
	const resizers = ["n", "s", "e", "w", "nw", "ne", "sw", "se"];
	resizers.forEach(direction => {
		const resizer = document.createElement("div");
		resizer.className = `resizer ${direction}`;
		dialog.appendChild(resizer);

		resizer.addEventListener("mousedown", (e) => {
			isResizing = true;
			currentResizer = direction;
			startX = e.clientX;
			startY = e.clientY;
			const rect = dialog.getBoundingClientRect();
			startLeft = rect.left;
			startTop = rect.top;
			startWidth = rect.width;
			startHeight = rect.height;
			e.preventDefault();
			e.stopPropagation();
		});
	});

	document.body.appendChild(dialog);

	dialog.show();

	closeButton.addEventListener("click", () => {
		dialog.close();
	});

	header.addEventListener("mousedown", (e) => {
		isDragging = true;
		startX = e.clientX;
		startY = e.clientY;
		// Use getBoundingClientRect for accurate positioning relative to the viewport
		const rect = dialog.getBoundingClientRect();
		startLeft = rect.left;
		startTop = rect.top;

		e.preventDefault();
	});

	window.addEventListener("mousemove", (e) => {
		if (isDragging) {
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;

			dialog.style.left = `${startLeft + dx}px`;
			dialog.style.top = `${startTop + dy}px`;
			dialog.style.margin = "0";
		} else if (isResizing && currentResizer) {
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;
			const minWidth = 150;
			const minHeight = 100;

			if (currentResizer.includes("e")) {
				dialog.style.width = `${Math.max(minWidth, startWidth + dx)}px`;
			}
			if (currentResizer.includes("w")) {
				const newWidth = Math.max(minWidth, startWidth - dx);
				const actualDx = startWidth - newWidth;
				dialog.style.width = `${newWidth}px`;
				dialog.style.left = `${startLeft + actualDx}px`;
			}
			if (currentResizer.includes("s")) {
				dialog.style.height = `${Math.max(minHeight, startHeight + dy)}px`;
			}
			if (currentResizer.includes("n")) {
				const newHeight = Math.max(minHeight, startHeight - dy);
				const actualDy = startHeight - newHeight;
				dialog.style.height = `${newHeight}px`;
				dialog.style.top = `${startTop + actualDy}px`;
			}
			dialog.style.margin = "0";
		}
	});

	window.addEventListener("mouseup", () => {
		isDragging = false;
		isResizing = false;
		currentResizer = null;
	});

	return () => {
		dialog.remove();
	};
}

export default { render };
