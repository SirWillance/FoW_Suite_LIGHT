export class PromptRefinerLightModal {
    constructor(node, positivePrompt = "", negativePrompt = "") {
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
        this.minWidth = 390;
        this.node = node;
        this.isCollapsed = false;
        this.isCollapsedPositive = true;
        this.isCollapsedNegative = true;
        this.showAlerts = true; // General tips toggle
        this.showConfirmations = true; // New: Confirmation popups toggle
        this.positivePrompt = positivePrompt;
        this.negativePrompt = negativePrompt;
        this.loadCSS();
        this.loadModalState(node);
    }

    loadCSS() {
        const cssId = "prl-single-input-modal-styles";
        if (!document.getElementById(cssId)) {
            const link = document.createElement("link");
            link.id = cssId;
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = new URL("./PromptRefinerLightModal.css", import.meta.url).href;
            document.head.appendChild(link);
            console.log("CSS loaded for prl-single-input-modal-styles");
        }
    }

    getModalTemplate(nodeId) {
        const title = this.node ? this.node.title || "Prompt Refiner Light" : "Prompt Refiner Light";
        return `
            <div class="prl-modal-titlebar">
                <h3>${title}</h3>
                <a href="https://www.twitch.tv/sirwillance/about" target="_blank" class="prl-contact-link" title="Follow me on Twitch for more info and support!">Contact: @SirWillance</a>
                <button class="prl-modal-collapse" title="Collapse or expand the modal window"> ${this.isCollapsed ? "+" : "-"}</button>
                <button class="prl-modal-close" title="Close the modal window">×</button>
            </div>
            <div class="prl-modal-content-wrapper">
                <div class="prl-operation-window">
                    <div class="prl-search-container">
                        <input type="text" class="prl-search-bar" placeholder="Pro Only Feature" disabled title="This feature is available in the Pro version" />
                        <button class="prl-clear-search" disabled title="Clear search (Pro version only)">❌</button>
                    </div>
                    <label class="prl-alert-toggle-label" title="Toggle guidance tips (enabled by default for beginners)">
                        <input type="checkbox" class="prl-alert-toggle" ${this.showAlerts ? "checked" : ""}> Show Tips
                    </label>
                    <div class="prl-button-group">
                        <button title="Clear all prompts from both fields" class="prl-clear-all">🧼</button>
                        <button title="Load prompts from a file (Pro version only)" class="prl-file-loader">📂</button>
                        <button title="Save prompts to a .txt file for collaboration" class="prl-file-saver">💾</button>
                        <button title="Enable tokenization (Pro version only)" class="prl-tokenize">✂</button>
                        <button title="Confirm and send prompts to ComfyUI" class="prl-confirm-input">✔</button>
                    </div>
                </div>
                <div class="prl-prompt-category-container" data-prompt-type="positive">
                    <div class="prl-prompt-category-header">
                        <label class="prl-prompt-category-label">👍 Positive Prompt</label>
                        <select class="prl-category-dropdown" data-prompt-type="positive" title="Choose input mode (Pro needed for five categories)">
                            <option value="single" selected>Single Input</option>
                            <option value="five">Five Categories (Upgrade Required)</option>
                        </select>
                    </div>
                    <div class="prl-prompt-category-content${this.isCollapsedPositive ? ' collapsed' : ''}">
                        <div class="prl-input-container">
                            <textarea id="positive-${nodeId}" class="prl-input-textarea" placeholder="Enter positive prompt..." title="Enter your desired prompt here"></textarea>
                            <button class="prl-clear-input" data-input="positive-${nodeId}" title="Clear the positive prompt">🧼</button>
                        </div>
                    </div>
                </div>
                <div class="prl-prompt-category-container" data-prompt-type="negative">
                    <div class="prl-prompt-category-header">
                        <label class="prl-prompt-category-label">👎 Negative Prompt</label>
                        <select class="prl-category-dropdown" data-prompt-type="negative" title="Choose input mode (Pro needed for five categories)">
                            <option value="single" selected>Single Input</option>
                            <option value="five">Five Categories (Upgrade Required)</option>
                        </select>
                    </div>
                    <div class="prl-prompt-category-content${this.isCollapsedNegative ? ' collapsed' : ''}">
                        <div class="prl-input-container">
                            <textarea id="negative-${nodeId}" class="prl-input-textarea" placeholder="Enter negative prompt..." title="Enter what you want to exclude from the prompt"></textarea>
                            <button class="prl-clear-input" data-input="negative-${nodeId}" title="Clear the negative prompt">🧼</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="prl-modal-resize-handle" style="display: ${this.isCollapsed ? 'none' : 'block'}" title="Resize the modal window"></div>
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
        this.modal.classList.add(this.modalClassName, `prl-modal-${node.id}`);
        this.modal.style.width = `${this.currentWidth}px`;
        this.modal.style.height = `${this.currentHeight}px`;
        this.modal.style.top = "100px";
        this.modal.style.left = "100px";
        this.modal.innerHTML = this.getModalTemplate(node.id);
        const positiveTextarea = this.modal.querySelector(`#positive-${node.id}`);
        const negativeTextarea = this.modal.querySelector(`#negative-${node.id}`);
        if (positiveTextarea) positiveTextarea.value = this.positivePrompt;
        if (negativeTextarea) negativeTextarea.value = this.negativePrompt;
        document.body.appendChild(this.modal);
        this.loadModalState(node);
        this.setupEventHandlers(this.modal, node);
        this.adjustModalHeight();
        return this.modal;
    }

    showPopup({ message, buttons = [], showToggle = false, toggleText = "", toggleState = false, onToggleChange = () => {}, isConfirmation = false }) {
        const popup = document.createElement("div");
        popup.className = "prl-popup prl-popup-warning" + (isConfirmation ? " prl-confirmation-popup" : "");
        popup.style.zIndex = "1005";
        popup.style.opacity = "0";
        popup.style.transition = "opacity 0.3s ease";
    
        const messageEl = document.createElement("div");
        messageEl.className = "prl-popup-message";
        messageEl.innerHTML = message;
        messageEl.style.marginBottom = "20px";
        messageEl.style.padding = "0 20px";
        popup.appendChild(messageEl);
    
        if (showToggle) {
            const toggleContainer = document.createElement("div");
            toggleContainer.className = "prl-popup-toggle";
            toggleContainer.style.marginBottom = "20px";
            const toggleInput = document.createElement("input");
            toggleInput.type = "checkbox";
            toggleInput.id = `prl-toggle-${Date.now()}`;
            toggleInput.checked = toggleState;
            toggleInput.className = "prl-alert-toggle";
            toggleInput.onchange = (e) => onToggleChange(e.target.checked);
            const toggleLabel = document.createElement("label");
            toggleLabel.htmlFor = toggleInput.id;
            toggleLabel.textContent = toggleText;
            toggleLabel.style.marginLeft = "5px";
            toggleContainer.append(toggleInput, toggleLabel);
            popup.appendChild(toggleContainer);
        }
    
        if (isConfirmation) {
            const confirmToggleContainer = document.createElement("div");
            confirmToggleContainer.className = "prl-popup-toggle";
            confirmToggleContainer.style.marginBottom = "20px";
            const confirmToggleInput = document.createElement("input");
            confirmToggleInput.type = "checkbox";
            confirmToggleInput.id = `prl-confirm-toggle-${Date.now()}`;
            confirmToggleInput.checked = false; // Default: unchecked
            confirmToggleInput.className = "prl-alert-toggle";
            confirmToggleInput.onchange = (e) => {
                this.showConfirmations = !e.target.checked; // Invert: checked means disable
                this.saveModalState(this.node); // Persist state
            };
            const confirmToggleLabel = document.createElement("label");
            confirmToggleLabel.htmlFor = confirmToggleInput.id;
            confirmToggleLabel.textContent = "Don’t show this again";
            confirmToggleLabel.style.marginLeft = "5px";
            confirmToggleContainer.append(confirmToggleInput, confirmToggleLabel);
            popup.appendChild(confirmToggleContainer);
        }
    
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "prl-popup-buttons";
        buttonContainer.style.display = "flex";
        buttonContainer.style.gap = "15px";
        buttonContainer.style.justifyContent = "center";
        buttons.forEach(btn => {
            const button = document.createElement("button");
            button.className = btn.text === "No" ? "prl-popup-cancel-button" : "prl-popup-button";
            button.textContent = btn.text;
            button.style.cursor = "pointer";
            button.onclick = () => {
                btn.onClick();
                popup.style.opacity = "0";
                setTimeout(() => popup.remove(), 300);
            };
            buttonContainer.appendChild(button);
        });
        popup.appendChild(buttonContainer);
    
        document.body.appendChild(popup);
        requestAnimationFrame(() => {
            popup.style.opacity = "1";
            popup.style.position = "fixed";
            popup.style.top = "50%";
            popup.style.left = "50%";
            popup.style.transform = "translate(-50%, -50%)";
            popup.style.backgroundColor = "var(--prl-modal-background)";
            popup.style.padding = "30px";
            popup.style.width = "450px";
            popup.style.minHeight = "150px";
            popup.style.borderRadius = "12px";
            popup.style.boxShadow = "var(--prl-modal-box-shadow)";
            popup.style.color = "var(--prl-modal-text)";
            popup.style.textAlign = "center";
            popup.style.border = "2px solid var(--prl-modal-border)";
        });
    }

    setupEventHandlers(modal, node) {
        const nodeId = node.id;
        const closeButton = modal.querySelector(".prl-modal-close");
        const collapseButton = modal.querySelector(".prl-modal-collapse");
        const clearAllButton = modal.querySelector(".prl-clear-all");
        const fileLoader = modal.querySelector(".prl-file-loader");
        const fileSaver = modal.querySelector(".prl-file-saver");
        const tokenizeButton = modal.querySelector(".prl-tokenize");
        const confirmButton = modal.querySelector(".prl-confirm-input");
        const clearInputButtons = modal.querySelectorAll(".prl-clear-input");
        const textareas = modal.querySelectorAll(".prl-input-textarea");
        const alertToggle = modal.querySelector(".prl-alert-toggle");
        const titleBar = modal.querySelector(".prl-modal-titlebar");
        const contentWrapper = modal.querySelector(".prl-modal-content-wrapper");
        const resizeHandle = modal.querySelector(".prl-modal-resize-handle");
        const contactLink = modal.querySelector(".prl-contact-link");
        const dropdowns = modal.querySelectorAll(".prl-category-dropdown");
    
        this.setupDragHandlers(modal, titleBar);
        this.setupResizeHandle(resizeHandle);
    
        this.showAlerts = this.getNodeData(node).showAlerts !== false;
        if (alertToggle) alertToggle.checked = this.showAlerts;
    
        closeButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.saveModalState(node);
            this.close(node);
            if (this.showAlerts) {
                this.showPopup({
                    message: "Modal closed! Reopen with the 'Open Prompt Editor' button in ComfyUI.",
                    buttons: [{ text: "OK", onClick: () => {} }]
                });
            }
        });
    
        collapseButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.isCollapsed = !this.isCollapsed;
            collapseButton.textContent = this.isCollapsed ? "+" : "-";
            contentWrapper.style.display = this.isCollapsed ? "none" : "block";
            resizeHandle.style.display = this.isCollapsed ? "none" : "block";
            contactLink.style.display = this.isCollapsed ? "none" : "inline";
            this.modal.classList.toggle("prl-modal-collapsed", this.isCollapsed);
            if (this.isCollapsed) {
                this.originalWidth = this.currentWidth;
                this.originalHeight = this.currentHeight;
                this.currentWidth = this.minimizedWidth;
                this.currentHeight = this.minHeight;
            } else {
                this.currentWidth = this.originalWidth;
                this.currentHeight = this.originalHeight;
            }
            this.modal.style.width = `${this.currentWidth}px`;
            this.modal.style.height = `${this.currentHeight}px`;
            this.adjustModalHeight();
            this.saveModalState(node);
            console.log("Collapse state updated:", {
                isCollapsed: this.isCollapsed,
                currentWidth: this.currentWidth,
                currentHeight: this.currentHeight,
                modalWidth: this.modal.offsetWidth,
                modalHeight: this.modal.offsetHeight
            });
            if (this.showAlerts) {
                this.showPopup({
                    message: "Modal collapsed/expanded! Drag to move, resize to adjust, or close with ×.",
                    buttons: [{ text: "OK", onClick: () => {} }]
                });
            }
        });
    
        clearAllButton.addEventListener("click", (e) => {
            e.stopPropagation();
            if (this.showConfirmations) {
                this.showPopup({
                    message: "Are you sure you want to clear all prompts?",
                    buttons: [
                        { text: "Yes", onClick: () => {
                            textareas.forEach(textarea => (textarea.value = ""));
                            this.saveModalState(node);
                            this.adjustModalHeight();
                            if (this.showAlerts) {
                                this.showPopup({
                                    message: "All prompts cleared! Enter new prompts or save again.",
                                    buttons: [{ text: "OK", onClick: () => {} }]
                                });
                            }
                        }},
                        { text: "No", onClick: () => {} }
                    ],
                    isConfirmation: true // Enable "Don’t show this again"
                });
            } else {
                // If confirmations are disabled, proceed directly
                textareas.forEach(textarea => (textarea.value = ""));
                this.saveModalState(node);
                this.adjustModalHeight();
                if (this.showAlerts) {
                    this.showPopup({
                        message: "All prompts cleared! Enter new prompts or save again.",
                        buttons: [{ text: "OK", onClick: () => {} }]
                    });
                }
            }
        });
    
        fileLoader.addEventListener("click", (e) => {
            e.stopPropagation();
            this.showPopup({
                message: `<h3 style="color:rgb(173, 12, 0);">Unlock More Power! 🚀</h3><br>Want to use Five Categories, Tokenization, or Load features? Consider upgrading to Standard or Pro for an even better Experience 😁!<br>Learn more at <a href="https://www.twitch.tv/SirWillance" target="_blank" class="catl-popup-link">twitch.tv/SirWillance`,
                buttons: [{ text: "Got It!", onClick: () => {} }]
            });
        });
    
        fileSaver.addEventListener("click", (e) => {
            e.stopPropagation();
            this.saveFile(nodeId);
            this.saveModalState(node);
            if (this.showAlerts) {
                this.showPopup({
                    message: "Prompts saved to PromptRefinerLightOutput.txt! Share this file for collaboration.",
                    buttons: [{ text: "OK", onClick: () => {} }]
                });
            }
        });
    
        tokenizeButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.showPopup({
                message: `<h3 style="color:rgb(173, 12, 0);">Unlock More Power! 🚀</h3><br>Want to use Five Categories, Tokenization, or Load features? Consider upgrading to Standard or Pro for an even better Experience 😁!<br>Learn more at <a href="https://www.twitch.tv/SirWillance" target="_blank" class="catl-popup-link">twitch.tv/SirWillance`,
                buttons: [{ text: "Got It!", onClick: () => {} }]
            });
        });
    
        confirmButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.saveModalState(node);
            this.confirmInput(node);
            if (this.showAlerts) {
                this.showPopup({
                    message: "Prompts confirmed and sent to ComfyUI! Check your workflow for results.",
                    buttons: [{ text: "OK", onClick: () => {} }]
                });
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
                        this.showPopup({
                            message: `"${inputId.startsWith("positive") ? "Positive" : "Negative"} Prompt" cleared! Enter new text or save again.`,
                            buttons: [{ text: "OK", onClick: () => {} }]
                        });
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
                this.showPopup({
                    message: "Guidance tips enabled! Uncheck 'Show Tips' to disable for advanced use.",
                    buttons: [{ text: "OK", onClick: () => {} }]
                });
            }
        });
    
        dropdowns.forEach(dropdown => {
            dropdown.addEventListener("change", (e) => {
                e.stopPropagation();
                if (dropdown.value === "five") {
                    e.preventDefault();
                    this.showPopup({
                        message: `<h3 style="color:rgb(173, 12, 0);">Unlock More Power! 🚀</h3><br>Want to use Five Categories, Tokenization, or Load features? Consider upgrading to Standard or Pro for an even better Experience 😁!<br>Learn more at <a href="https://www.twitch.tv/SirWillance" target="_blank" class="catl-popup-link">twitch.tv/SirWillance`,
                        buttons: [{ text: "Got It!", onClick: () => { dropdown.value = "single"; } }]
                    });
                }
            });
        });
    
        const categoryContainers = modal.querySelectorAll(".prl-prompt-category-container");
        categoryContainers.forEach(container => {
            const header = container.querySelector(".prl-prompt-category-header");
            const promptType = container.dataset.promptType;
            header.addEventListener("click", (event) => {
                if (event.target.closest(".prl-input-textarea, .prl-clear-input, .prl-category-dropdown")) return;
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
                console.log("Category collapse state saved:", { isCollapsedPositive: this.isCollapsedPositive, isCollapsedNegative: this.isCollapsedNegative });
                if (this.showAlerts) {
                    this.showPopup({
                        message: `${promptType === "positive" ? "Positive" : "Negative"} Prompt ${this.isCollapsedPositive || this.isCollapsedNegative ? "collapsed" : "expanded"}! Click to toggle.`,
                        buttons: [{ text: "OK", onClick: () => {} }]
                    });
                }
            });
        });
    }

    performSearch(query) {
        console.log("Performing search with query:", query);
    }

    adjustModalHeight() {
        if (!this.modal) return;
        if (!this.isCollapsed) {
            const contentWrapper = this.modal.querySelector(".prl-modal-content-wrapper");
            if (contentWrapper) {
                requestAnimationFrame(() => {
                    const contentHeight = contentWrapper.scrollHeight + 40;
                    const newHeight = Math.max(this.minHeight, Math.min(contentHeight, this.maxHeight));
                    this.currentHeight = newHeight;
                    this.originalHeight = newHeight;
                    this.modal.style.height = `${newHeight}px`;
                    this.saveModalState(this.node);
                    console.log("Adjusted height (expanded):", { currentHeight: this.currentHeight, contentHeight: contentHeight });
                });
            }
        } else {
            this.modal.style.height = `${this.minHeight}px`; // Ensure collapsed height is enforced
            console.log("Adjusted height (collapsed):", { currentHeight: this.minHeight });
        }
    }

    setupDragHandlers(modal, titleBar) {
        let isDragging = false;
        let offsetX, offsetY;

        const mousemoveHandler = (e) => {
            if (!isDragging || !modal) return;
            modal.style.left = `${e.clientX - offsetX}px`;
            modal.style.top = `${e.clientY - offsetY}px`;
        };

        const mouseupHandler = () => {
            isDragging = false;
            document.removeEventListener("mousemove", mousemoveHandler);
            document.removeEventListener("mouseup", mouseupHandler);
        };

        titleBar.addEventListener("mousedown", (e) => {
            if (!modal) return;
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
            if (this.isCollapsed || !this.modal) return;
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = this.modal.offsetWidth;
            startHeight = this.modal.offsetHeight;
            document.addEventListener("mousemove", resizeHandler);
            document.addEventListener("mouseup", () => {
                isResizing = false;
                document.removeEventListener("mousemove", resizeHandler);
                if (this.modal) {
                    this.currentWidth = Math.max(this.modal.offsetWidth, this.minWidth);
                    this.currentHeight = Math.max(this.modal.offsetHeight, this.minHeight);
                    this.originalWidth = this.currentWidth;
                    this.originalHeight = this.currentHeight;
                    this.modal.style.width = `${this.currentWidth}px`;
                    this.modal.style.height = `${this.currentHeight}px`;
                    this.adjustModalHeight();
                    this.saveModalState(this.node);
                    console.log("Resize state saved:", { currentWidth: this.currentWidth, currentHeight: this.currentHeight });
                }
            });
        });

        const resizeHandler = (e) => {
            if (!isResizing || !this.modal) return;
            const newWidth = Math.max(startWidth + (e.clientX - startX), this.minWidth);
            const newHeight = Math.max(startHeight + (e.clientY - startY), this.minHeight);
            this.modal.style.width = `${newWidth}px`;
            this.modal.style.height = `${newHeight}px`;
        };
    }

    saveFile(nodeId) {
        if (!this.modal) return;
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
                this.showPopup({
                message: "Prompt Confirmed! Please proceed with your workflow or just execute it.",
                buttons: [{ text: "OK", onClick: () => {} }]
            });
        
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
        if (!this.modal || !node) return;
        console.log("Saving modal state for node:", node.id);
        const nodeId = node.id;
        const nodeData = this.getNodeData(node) || {};
    
        nodeData.currentWidth = this.currentWidth;
        nodeData.currentHeight = this.currentHeight;
        nodeData.originalWidth = this.originalWidth;
        nodeData.originalHeight = this.originalHeight;
        nodeData.isCollapsed = this.isCollapsed;
        nodeData.isCollapsedPositive = this.isCollapsedPositive;
        nodeData.isCollapsedNegative = this.isCollapsedNegative;
        nodeData.positive = this.modal.querySelector(`#positive-${nodeId}`).value || this.positivePrompt;
        nodeData.negative = this.modal.querySelector(`#negative-${nodeId}`).value || this.negativePrompt;
        nodeData.showAlerts = this.showAlerts;
        nodeData.showConfirmations = this.showConfirmations; // New
    
        this.setNodeData(node, nodeData);
        console.log("State after saving:", nodeData);
    }
    
    loadModalState(node) {
        console.log("Loading modal state for node:", node.id);
        const nodeId = node.id;
        let nodeData = {};
    
        if (node.properties && node.properties.modalState) {
            try {
                nodeData = JSON.parse(node.properties.modalState);
                console.log("Loaded modal state from node.properties:", nodeData);
            } catch (e) {
                console.warn("Failed to parse modal state from node.properties, using defaults:", e);
            }
        }
    
        this.currentWidth = Math.max(nodeData.currentWidth || this.defaultWidth, this.defaultWidth);
        this.currentHeight = Math.max(nodeData.currentHeight || this.defaultHeight, this.minHeight);
        this.originalWidth = nodeData.originalWidth || this.defaultWidth;
        this.originalHeight = nodeData.originalHeight || this.defaultHeight;
        this.isCollapsed = nodeData.isCollapsed || false;
        this.isCollapsedPositive = nodeData.isCollapsedPositive !== undefined ? nodeData.isCollapsedPositive : true;
        this.isCollapsedNegative = nodeData.isCollapsedNegative !== undefined ? nodeData.isCollapsedNegative : true;
        this.showAlerts = nodeData.showAlerts !== false;
        this.showConfirmations = nodeData.showConfirmations !== false; // New: Default to true
    
        if (this.modal) {
            this.modal.classList.toggle("prl-modal-collapsed", this.isCollapsed);
            this.modal.style.width = `${this.currentWidth}px`;
            this.modal.style.height = `${this.currentHeight}px`;
        }
    
        const contentWrapper = this.modal?.querySelector(".prl-modal-content-wrapper");
        const resizeHandle = this.modal?.querySelector(".prl-modal-resize-handle");
        const collapseButton = this.modal?.querySelector(".prl-modal-collapse");
        const contactLink = this.modal?.querySelector(".prl-contact-link");
        if (contentWrapper) contentWrapper.style.display = this.isCollapsed ? "none" : "block";
        if (resizeHandle) resizeHandle.style.display = this.isCollapsed ? "none" : "block";
        if (contactLink) contactLink.style.display = this.isCollapsed ? "none" : "inline";
        if (collapseButton) collapseButton.textContent = this.isCollapsed ? "+" : "-";
    
        if (this.isCollapsed) {
            this.currentWidth = this.minimizedWidth;
            this.currentHeight = this.minHeight;
            if (this.modal) {
                this.modal.style.width = `${this.currentWidth}px`;
                this.modal.style.height = `${this.currentHeight}px`;
            }
        } else {
            this.adjustModalHeight();
        }
    
        const positiveTextarea = this.modal?.querySelector(`#positive-${nodeId}`);
        const negativeTextarea = this.modal?.querySelector(`#negative-${nodeId}`);
        const alertToggle = this.modal?.querySelector(".prl-alert-toggle");
        if (positiveTextarea) positiveTextarea.value = nodeData.positive || "";
        if (negativeTextarea) negativeTextarea.value = nodeData.negative || "";
        if (alertToggle) alertToggle.checked = this.showAlerts;
    
        const positiveContent = this.modal?.querySelector('.prl-prompt-category-container[data-prompt-type="positive"] .prl-prompt-category-content');
        const negativeContent = this.modal?.querySelector('.prl-prompt-category-container[data-prompt-type="negative"] .prl-prompt-category-content');
        if (positiveContent) positiveContent.classList.toggle("collapsed", this.isCollapsedPositive);
        if (negativeContent) negativeContent.classList.toggle("collapsed", this.isCollapsedNegative);
        console.log("Modal state loaded:", { isCollapsed: this.isCollapsed, isCollapsedPositive: this.isCollapsedPositive, isCollapsedNegative: this.isCollapsedNegative });
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
        return node.properties && node.properties.modalState ? JSON.parse(node.properties.modalState) : {};
    }

    setNodeData(node, data) {
        node.properties = node.properties || {};
        node.properties.modalState = JSON.stringify(data);
    }
}