import type { RenderProps } from "@anywidget/types";
import "./widget.css";

interface WidgetModel {
	dirPath: string;
}

function render({ model, el }: RenderProps<WidgetModel>) {
	el.classList.add("jupyter_host_filebrowser");
	el.style.position = "relative";
	el.style.display="none";

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

	model.on("msg:custom", (message)=>{
		if (message.type === "res:list-dir") {
			const list = document.createElement("ul");
			for (const f of message.payload) {
				const li = document.createElement("li");
				li.textContent = f;
				li.addEventListener("click", () => {
					model.set("dirPath", f);
					model.send({ type: "req:list-dir", payload: {path: f}});
				});
				list.appendChild(li);
			}
			content.replaceChildren(list);
		}
	});
	model.send({ type: "req:list-dir", payload: {path: model.get("dirPath")} });

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

	const onMouseMove = (e: MouseEvent) => {
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const minVisible = 20;

		if (isDragging) {
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;
			const rect = dialog.getBoundingClientRect();
			const hHeight = header.offsetHeight;

			let newLeft = startLeft + dx;
			let newTop = startTop + dy;

			// Ensure at least some part of the header is visible
			newLeft = Math.max(-(rect.width - minVisible), Math.min(newLeft, viewportWidth - minVisible));
			newTop = Math.max(-(hHeight - minVisible), Math.min(newTop, viewportHeight - minVisible));

			dialog.style.left = `${newLeft}px`;
			dialog.style.top = `${newTop}px`;
			dialog.style.margin = "0";
		} else if (isResizing && currentResizer) {
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;
			const minWidth = 150;
			const minHeight = 100;
			const hHeight = header.offsetHeight;

			if (currentResizer.includes("e")) {
				dialog.style.width = `${Math.max(minWidth, Math.min(startWidth + dx, viewportWidth))}px`;
			}
			if (currentResizer.includes("w")) {
				let newWidth = Math.max(minWidth, Math.min(startWidth - dx, viewportWidth));
				let newLeft = startLeft + (startWidth - newWidth);

				// Ensure header visibility
				if (newLeft < -(newWidth - minVisible)) {
					newLeft = -(newWidth - minVisible);
					newWidth = startLeft + startWidth - newLeft;
				} else if (newLeft > viewportWidth - minVisible) {
					newLeft = viewportWidth - minVisible;
					newWidth = startLeft + startWidth - newLeft;
				}

				dialog.style.width = `${newWidth}px`;
				dialog.style.left = `${newLeft}px`;
			}
			if (currentResizer.includes("s")) {
				dialog.style.height = `${Math.max(minHeight, Math.min(startHeight + dy, viewportHeight))}px`;
			}
			if (currentResizer.includes("n")) {
				let newHeight = Math.max(minHeight, Math.min(startHeight - dy, viewportHeight));
				let newTop = startTop + (startHeight - newHeight);

				// Ensure header visibility
				if (newTop < -(hHeight - minVisible)) {
					newTop = -(hHeight - minVisible);
					newHeight = startTop + startHeight - newTop;
				} else if (newTop > viewportHeight - minVisible) {
					newTop = viewportHeight - minVisible;
					newHeight = startTop + startHeight - newTop;
				}

				dialog.style.height = `${newHeight}px`;
				dialog.style.top = `${newTop}px`;
			}
			dialog.style.margin = "0";
		}
	};

	const onMouseUp = () => {
		isDragging = false;
		isResizing = false;
		currentResizer = null;
	};

	const onResize = () => {
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const minVisible = 20;
		const hHeight = header.offsetHeight;
		const rect = dialog.getBoundingClientRect();

		let newLeft = rect.left;
		let newTop = rect.top;
		let changed = false;

		const constrainedLeft = Math.max(-(rect.width - minVisible), Math.min(newLeft, viewportWidth - minVisible));
		if (constrainedLeft !== newLeft) {
			newLeft = constrainedLeft;
			changed = true;
		}

		const constrainedTop = Math.max(-(hHeight - minVisible), Math.min(newTop, viewportHeight - minVisible));
		if (constrainedTop !== newTop) {
			newTop = constrainedTop;
			changed = true;
		}

		if (changed) {
			dialog.style.left = `${newLeft}px`;
			dialog.style.top = `${newTop}px`;
		}
	};

	window.addEventListener("mousemove", onMouseMove);
	window.addEventListener("mouseup", onMouseUp);
	window.addEventListener("resize", onResize);

	return () => {
		dialog.remove();
		window.removeEventListener("mousemove", onMouseMove);
		window.removeEventListener("mouseup", onMouseUp);
		window.removeEventListener("resize", onResize);
	};
}

export default { render };
