export class PromptRefinerLightModal {
    constructor(config) {
        this.type = "promptrefinerlight";
        this.modal = null;
        this.isOpen = false;
        this.modalClassName = "prl-modal";
        this.defaultWidth = 600;
        this.defaultHeight = 300;
        this.minimizedWidth = 390;
        this.minHeight = 40;
        this.maxHeight = 800;
        this.currentWidth = this.defaultWidth;
        this.currentHeight = this.defaultHeight;
        this.originalWidth = this.defaultWidth;
        this.originalHeight = this.defaultHeight;
        this.minWidth = 390; // New minimum width
        this.node = null;
        this.isCollapsed = false;
        this.isCollapsedPositive = true;
        this.isCollapsedNegative = true;
        this.loadCSS();
    }

    loadCSS() {
        const cssId = "prl-modal-styles";
        if (!document.getElementById(cssId)) {
            const link = document.createElement("link");
            link.id = cssId;
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = new URL("./PromptRefinerLightModal.css", import.meta.url).href;
            document.head.appendChild(link);
        }
    }

    getModalTemplate(nodeId) {
        return `
            <div class="prl-modal-titlebar">
                <h3>⌨ FoW - Prompt Refiner Light</h3>
                <button class="prl-modal-collapse" title="Collapse/Expand Modal"> ${this.isCollapsed ? "+" : "-"}</button>
                <button class="prl-modal-close" title="Close Modal">×</button>
            </div>
            <div class="prl-modal-content-wrapper" style="display: ${this.isCollapsed ? 'none' : 'block'}">
                <div class="prl-operation-window">
                    <label class="prl-alert-toggle-label" title="Toggle Guidance Alerts (On by Default for Newbies)">
                        <input type="checkbox" class="prl-alert-toggle" ${this.showAlerts ? "checked" : ""}> Show Tips
                    </label>
                    <div class="prl-button-group">
                        <button title="Clear All Prompts" class="prl-clear-all">🧼</button>
                        <button title="Save Prompts to .txt File for Collaboration" class="prl-save">💾</button>
                        <button title="Confirm and Send Prompts to ComfyUI" class="prl-confirm">✔</button>
                    </div>
                </div>
                <div class="prl-prompt-category-container" data-prompt-type="positive">
                    <div class="prl-prompt-category-header">
                        <label class="prl-prompt-category-label">Positive Prompt</label>
                    </div>
                    <div class="prl-prompt-category-content${this.isCollapsedPositive ? ' collapsed' : ''}">
                        <div class="prl-input-container">
                            <textarea id="positive-${nodeId}" class="prl-input-textarea" placeholder="Enter positive prompt..."></textarea>
                            <button class="prl-clear-input" data-input="positive-${nodeId}" title="Clear Positive Prompt">🧼</button>
                        </div>
                    </div>
                </div>
                <div class="prl-prompt-category-container" data-prompt-type="negative">
                    <div class="prl-prompt-category-header">
                        <label class="prl-prompt-category-label">Negative Prompt</label>
                    </div>
                    <div class="prl-prompt-category-content${this.isCollapsedNegative ? ' collapsed' : ''}">
                        <div class="prl-input-container">
                            <textarea id="negative-${nodeId}" class="prl-input-textarea" placeholder="Enter negative prompt..."></textarea>
                            <button class="prl-clear-input" data-input="negative-${nodeId}" title="Clear Negative Prompt">🧼</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="prl-modal-resize-handle" style="display: ${this.isCollapsed ? 'none' : 'block'}" title="Resize Modal"></div>
        `;
    }

    create(node) {
        if (node.modal && node.modal.isOpen) {
            console.log("Modal is already open for node:", node.id);
            return;
        }
        if (node.modal) {
            node.modal.close(node);
        }
        node.modal = this;
        this.isOpen = true;
        this.node = node;
        console.log(`Opening ${this.type} modal for node ${node.id}...`);
        this.modal = document.createElement("div");
        this.modal.classList.add(this.modalClassName, `prl-modal-${node.id}`); // Unique class per node
        this.modal.style.width = `${this.currentWidth}px`;
        this.modal.style.height = `${this.currentHeight}px`;
        this.modal.style.top = "100px";
        this.modal.style.left = "100px";
        this.modal.innerHTML = this.getModalTemplate(node.id); // Pass node ID for unique IDs
        document.body.appendChild(this.modal);
        this.loadModalState(node);
        this.setupEventHandlers(this.modal, node);
        this.adjustModalHeight();
        return this.modal;
    }

    setupEventHandlers(modal, node) {
        const nodeId = node.id;
        const closeButton = modal.querySelector(".prl-modal-close");
        const collapseButton = modal.querySelector(".prl-modal-collapse");
        const clearAllButton = modal.querySelector(".prl-clear-all");
        const saveButton = modal.querySelector(".prl-save");
        const confirmButton = modal.querySelector(".prl-confirm");
        const clearInputButtons = modal.querySelectorAll(".prl-clear-input");
        const textareas = modal.querySelectorAll(".prl-input-textarea");
        const alertToggle = modal.querySelector(".prl-alert-toggle");
        const titleBar = modal.querySelector(".prl-modal-titlebar");
        const contentWrapper = modal.querySelector(".prl-modal-content-wrapper");
        const resizeHandle = modal.querySelector(".prl-modal-resize-handle");

        this.setupDragHandlers(modal, titleBar);
        this.setupResizeHandle(resizeHandle);

        this.showAlerts = this.getNodeData(node).showAlerts !== false;
        if (alertToggle) alertToggle.checked = this.showAlerts;

        closeButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.saveModalState(node);
            this.close(node);
            if (this.showAlerts) {
                alert("Modal closed! Reopen with the 'Open Prompt Editor' button in ComfyUI.");
            }
        });

        collapseButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.isCollapsed = !this.isCollapsed;
            collapseButton.textContent = this.isCollapsed ? "+" : "-";
            contentWrapper.style.display = this.isCollapsed ? "none" : "block";
            resizeHandle.style.display = this.isCollapsed ? "none" : "block";
            if (this.isCollapsed) {
                const titleBarWidth = this.minimizedWidth;
                const titleBarHeight = Math.max(this.minHeight, titleBar.offsetHeight);
                this.originalWidth = this.currentWidth;
                this.originalHeight = this.currentHeight;
                this.currentWidth = titleBarWidth;
                this.currentHeight = titleBarHeight;
                this.modal.style.width = `${this.currentWidth}px`;
                this.modal.style.height = `${this.currentHeight}px`;
            } else {
                this.adjustModalHeight();
            }
            this.saveModalState(node);
            if (this.showAlerts) {
                alert("Modal collapsed/expanded! Drag to move, resize to adjust, or close with ×.");
            }
        });

        clearAllButton.addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm("Are you sure you want to clear all prompts?")) {
                textareas.forEach(textarea => (textarea.value = ""));
                this.saveModalState(node);
                this.adjustModalHeight();
                if (this.showAlerts) {
                    alert("All prompts cleared! Enter new prompts or load a .txt file with 💾.");
                }
            }
        });

        saveButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.saveFile(nodeId);
            this.saveModalState(node);
            if (this.showAlerts) {
                alert("Prompts saved to PromptRefinerLightOutput.txt! Share this file for collaboration.");
            }
        });

        confirmButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.saveModalState(node);
            this.confirmInput(node);
            if (this.showAlerts) {
                alert("Prompts confirmed and sent to ComfyUI! Check your workflow for results.");
            }
        });

        clearInputButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                const inputId = button.dataset.input;
                const textarea = modal.querySelector(`#${inputId}`);
                if (textarea) {
                    textarea.value = "";
                    this.saveModalState(node);
                    this.adjustModalHeight();
                    if (this.showAlerts) {
                        alert(`"${inputId.startsWith("positive") ? "Positive" : "Negative"} Prompt" cleared! Enter new text or load a file.`);
                    }
                }
            });
        });

        textareas.forEach(textarea => {
            textarea.addEventListener("input", (e) => {
                e.stopPropagation();
                this.saveModalState(node);
                this.adjustModalHeight();
            });
        });

        alertToggle.addEventListener("change", (e) => {
            e.stopPropagation();
            this.showAlerts = alertToggle.checked;
            this.saveModalState(node);
            if (this.showAlerts) {
                alert("Guidance tips enabled! Uncheck 'Show Tips' to disable for advanced use.");
            }
        });

        const categoryContainers = modal.querySelectorAll(".prl-prompt-category-container");
        categoryContainers.forEach(container => {
            const header = container.querySelector(".prl-prompt-category-header");
            const promptType = container.dataset.promptType;
            header.addEventListener("click", (event) => {
                if (event.target.closest(".prl-input-textarea, .prl-clear-input")) return;
                event.stopPropagation();
                if (promptType === "positive") {
                    this.isCollapsedPositive = !this.isCollapsedPositive;
                } else {
                    this.isCollapsedNegative = !this.isCollapsedNegative;
                }
                const content = container.querySelector(".prl-prompt-category-content");
                content.classList.toggle("collapsed", promptType === "positive" ? this.isCollapsedPositive : this.isCollapsedNegative);
                this.saveModalState(node);
                this.adjustModalHeight();
                if (this.showAlerts) {
                    alert(`${promptType === "positive" ? "Positive" : "Negative"} Prompt ${this.isCollapsedPositive || this.isCollapsedNegative ? "collapsed" : "expanded"}! Click to toggle.`);
                }
            });
        });
    }

    adjustModalHeight() {
        if (!this.isCollapsed && this.modal) {
            const contentWrapper = this.modal.querySelector(".prl-modal-content-wrapper");
            if (contentWrapper) {
                requestAnimationFrame(() => {
                    const contentHeight = contentWrapper.scrollHeight + 40;
                    const newHeight = Math.max(this.minHeight, Math.min(contentHeight, this.maxHeight));
                    this.currentHeight = newHeight;
                    this.originalHeight = newHeight;
                    this.modal.style.height = `${newHeight}px`;
                    this.saveModalState(this.node);
                });
            }
        }
    }

    setupDragHandlers(modal, titleBar) {
        let isDragging = false;
        let offsetX, offsetY;

        const mousemoveHandler = (e) => {
            if (!isDragging) return;
            modal.style.left = `${e.clientX - offsetX}px`;
            modal.style.top = `${e.clientY - offsetY}px`;
        };

        const mouseupHandler = () => {
            isDragging = false;
            document.removeEventListener("mousemove", mousemoveHandler);
            document.removeEventListener("mouseup", mouseupHandler);
        };

        titleBar.addEventListener("mousedown", (e) => {
            isDragging = true;
            offsetX = e.clientX - modal.offsetLeft;
            offsetY = e.clientY - modal.offsetTop;
            document.addEventListener("mousemove", mousemoveHandler);
            document.addEventListener("mouseup", mouseupHandler);
        });
    }

    setupResizeHandle(resizeHandle) {
        let isResizing = false;
        let startX, startY, startWidth, startHeight;

        resizeHandle.addEventListener("mousedown", (e) => {
            e.preventDefault();
            if (this.isCollapsed) return;
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = this.modal.offsetWidth;
            startHeight = this.modal.offsetHeight;
            document.addEventListener("mousemove", resizeHandler);
            document.addEventListener("mouseup", () => {
                isResizing = false;
                document.removeEventListener("mousemove", resizeHandler);
                this.currentWidth = Math.max(this.modal.offsetWidth, this.minWidth);
                this.currentHeight = Math.max(this.modal.offsetHeight, this.minHeight);
                this.originalWidth = this.currentWidth;
                this.originalHeight = this.currentHeight;
                this.modal.style.width = `${this.currentWidth}px`;
                this.modal.style.height = `${this.currentHeight}px`;
                if (this.node) {
                    this.saveModalState(this.node);
                }
                this.adjustModalHeight();
            });
        });

        const resizeHandler = (e) => {
            if (!isResizing) return;
            const newWidth = Math.max(startWidth + (e.clientX - startX), this.minWidth);
            const newHeight = Math.max(startHeight + (e.clientY - startY), this.minHeight);
            this.modal.style.width = `${newWidth}px`;
            this.modal.style.height = `${newHeight}px`;
        };
    }

    saveFile(nodeId) {
        const positive = this.modal.querySelector(`#positive-${nodeId}`).value.trim();
        const negative = this.modal.querySelector(`#negative-${nodeId}`).value.trim();
        const textToSave = `${positive}\n${negative}`.trim();
        this.downloadFile(textToSave, "PromptRefinerLightOutput.txt", "text/plain");
    }

    confirmInput(node) {
        const nodeId = node.id;
        const positive = this.modal.querySelector(`#positive-${nodeId}`).value.trim();
        const negative = this.modal.querySelector(`#negative-${nodeId}`).value.trim();

        const positiveWidgets = [
            "positive_subject", "positive_environment", "positive_style",
            "positive_shot", "positive_detail"
        ];
        positiveWidgets.forEach(name => {
            const widget = node.widgets.find(w => w.name === name);
            if (widget) {
                widget.value = name === "positive_subject" ? positive : "";
                if (widget.callback) widget.callback(widget.value);
            }
        });

        const negativeWidgets = [
            "negative_static", "negative_content", "negative_definition",
            "negative_dynamic"
        ];
        negativeWidgets.forEach(name => {
            const widget = node.widgets.find(w => w.name === name);
            if (widget) {
                widget.value = name === "negative_static" ? negative : "";
                if (widget.callback) widget.callback(widget.value);
            }
        });

        console.log("Confirmed Data sent to backend for node:", node.id);
        alert("Data confirmed and sent to the backend.");
        this.saveModalState(node);        
    }

    downloadFile(text, name, type) {
        const file = new Blob([text], { type });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file);
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    saveModalState(node) {
        console.log("Saving modal state for node:", node.id);
        const nodeData = this.getNodeData(node) || {};
        const nodeId = node.id;
        nodeData.currentWidth = this.currentWidth;
        nodeData.currentHeight = this.currentHeight;
        nodeData.originalWidth = this.originalWidth;
        nodeData.originalHeight = this.originalHeight;
        nodeData.isCollapsed = this.isCollapsed;
        nodeData.positive = this.modal.querySelector(`#positive-${nodeId}`).value;
        nodeData.negative = this.modal.querySelector(`#negative-${nodeId}`).value;
        nodeData.isCollapsedPositive = this.isCollapsedPositive;
        nodeData.isCollapsedNegative = this.isCollapsedNegative;
        nodeData.showAlerts = this.showAlerts;
        this.setNodeData(node, nodeData);
        console.log("Modal state saved:", nodeData);
    }

    loadModalState(node) {
        console.log("Loading modal state for node:", node.id);
        const nodeData = this.getNodeData(node) || {};
        const nodeId = node.id;
        this.currentWidth = Math.max(nodeData.currentWidth || this.defaultWidth, this.defaultWidth);
        this.currentHeight = Math.max(nodeData.currentHeight || this.defaultHeight, this.minHeight);
        this.originalWidth = nodeData.originalWidth || this.defaultWidth;
        this.originalHeight = nodeData.originalHeight || this.defaultHeight;
        this.isCollapsed = nodeData.isCollapsed || false;
        this.isCollapsedPositive = nodeData.isCollapsedPositive !== undefined ? nodeData.isCollapsedPositive : true;
        this.isCollapsedNegative = nodeData.isCollapsedNegative !== undefined ? nodeData.isCollapsedNegative : true;
        this.showAlerts = nodeData.showAlerts !== false;

        this.modal.style.width = `${this.currentWidth}px`;
        this.modal.style.height = `${this.currentHeight}px`;

        const contentWrapper = this.modal.querySelector(".prl-modal-content-wrapper");
        const resizeHandle = this.modal.querySelector(".prl-modal-resize-handle");
        const collapseButton = this.modal.querySelector(".prl-modal-collapse");
        contentWrapper.style.display = this.isCollapsed ? "none" : "block";
        resizeHandle.style.display = this.isCollapsed ? "none" : "block";
        collapseButton.textContent = this.isCollapsed ? "+" : "-";

        if (this.isCollapsed) {
            this.modal.style.width = `${this.minimizedWidth}px`;
            this.modal.style.height = `${this.minHeight}px`;
        } else {
            this.adjustModalHeight();
        }

        const positiveTextarea = this.modal.querySelector(`#positive-${nodeId}`);
        const negativeTextarea = this.modal.querySelector(`#negative-${nodeId}`);
        const alertToggle = this.modal.querySelector(".prl-alert-toggle");
        positiveTextarea.value = nodeData.positive || "";
        negativeTextarea.value = nodeData.negative || "";
        if (alertToggle) {
            alertToggle.checked = this.showAlerts;
        }

        const positiveContent = this.modal.querySelector('.prl-prompt-category-container[data-prompt-type="positive"] .prl-prompt-category-content');
        const negativeContent = this.modal.querySelector('.prl-prompt-category-container[data-prompt-type="negative"] .prl-prompt-category-content');
        positiveContent.classList.toggle("collapsed", this.isCollapsedPositive);
        negativeContent.classList.toggle("collapsed", this.isCollapsedNegative);
        console.log("Modal state loaded successfully.");
    }

    close(node) {
        this.saveModalState(node);
        this.cleanup();
        if (node && node.modal === this) node.modal = null;
        this.isOpen = false;
    }

    cleanup() {
        if (this.modal) {
            document.body.removeChild(this.modal);
            this.modal = null;
        }
    }

    getNodeData(node) {
        return node.widgets_values || {};
    }

    setNodeData(node, data) {
        node.widgets_values = data;
    }
}