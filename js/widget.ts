import type { RenderProps } from "@anywidget/types";
import "./widget.css";

interface WidgetModel {
}

function render({ model: _model, el }: RenderProps<WidgetModel>) {
	el.classList.add("jupyter_host_filebrowser");
	el.style.position = "relative";
	el.style.height = "500px";

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
	content.textContent = "This is a dialog that you can drag by the header and resize from the bottom-right corner.";

	dialog.appendChild(header);
	dialog.appendChild(content);
	document.body.appendChild(dialog);

	dialog.show();

	closeButton.addEventListener("click", () => {
		dialog.close();
	});

	// Dragging logic
	let isDragging = false;
	let startX = 0;
	let startY = 0;
	let startLeft = 0;
	let startTop = 0;

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
		if (!isDragging) return;

		const dx = e.clientX - startX;
		const dy = e.clientY - startY;

		dialog.style.left = `${startLeft + dx}px`;
		dialog.style.top = `${startTop + dy}px`;
		dialog.style.margin = "0";
	});

	window.addEventListener("mouseup", () => {
		isDragging = false;
	});

	return () => {
		dialog.remove();
	};
}

export default { render };
