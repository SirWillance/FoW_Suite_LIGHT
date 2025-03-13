export class EnvironmentCategoryModalLight {
    constructor(node) {
        this.node = node;
        this.type = "environmentrefinerlight";
        this.modal = null;
        this.isOpen = false;
        this.modalClassName = `catl-modal`;
        this.isResizing = false;
        this.isCollapsed = false;

        this.defaultWidth = 650;
        this.defaultHeight = 250;
        this.minimizedWidth = 470;
        this.minimizedHeight = 40;
        this.currentWidth = this.defaultWidth;
        this.currentHeight = this.defaultHeight;
        this.originalWidth = this.defaultWidth;
        this.originalHeight = this.defaultHeight;
        this.minWidth = 420;
        this.minHeight = 200;

        this.categoryStates = { "environment": false, "environment-style-note": false };
        this.subcategoryStates = {};
        this.loadCSS();
    }

    loadCSS() {
        const cssId = "catl-modal-styles";
        if (!document.getElementById(cssId)) {
            const link = document.createElement('link');
            link.id = cssId;
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = new URL("./CategoryModal.css", import.meta.url).href;
            document.head.appendChild(link);
        }
    }

    showUpgradeMessage(feature) {
        const nodeData = this.getNodeData(this.node);
        const suppressKey = `suppress${feature.replace(/\s+/g, '')}Popup`;
        const isSuppressed = nodeData[suppressKey] || false;

        if (!isSuppressed) {
            const popup = document.createElement("div");
            popup.className = "catl-popup catl-popup-warning";
            popup.innerHTML = `
                <div class="catl-popup-message"><h3 style="color:rgb(173, 12, 0);">Unlock More Power! 🚀</h3><p>The full "${feature}" feature is available in the Pro version.</p> Consider upgrading to Standard or Pro for an even better Experience 😁!<br>Learn more at <a href="https://www.twitch.tv/SirWillance" target="_blank" class="catl-popup-link">twitch.tv/SirWillance</a>.</div>
                <div class="catl-popup-toggle">
                    <input type="checkbox" id="catl-suppress-${feature.replace(/\s+/g, '')}" ${isSuppressed ? "checked" : ""}>
                    <label for="catl-suppress-${feature.replace(/\s+/g, '')}">Don’t show this message again</label>
                </div>
                <div class="catl-popup-buttons">
                    <button class="catl-popup-button">OK</button>
                </div>
            `;

            document.body.appendChild(popup);

            const closeButton = popup.querySelector(".catl-popup-button");
            const toggle = popup.querySelector("input[type='checkbox']");
            const closePopup = () => document.body.removeChild(popup);

            closeButton.addEventListener("click", closePopup);
            toggle.addEventListener("change", (e) => {
                const updatedNodeData = { ...nodeData, [suppressKey]: e.target.checked };
                this.setNodeData(this.node, updatedNodeData);
                this.saveModalState(this.node);
            });
        }
    }

    getModalTemplate() {
        const title = this.node ? this.node.title || "Environment Refiner Light" : "Environment Refiner Light";
        return `
            <div class="catl-modal-titlebar">
                <h3>${title}</h3>
                <div class="catl-modal-titlebar-right ${this.isCollapsed ? 'collapsed' : ''}">
                    <a href="https://www.twitch.tv/sirwillance" target="_blank" class="catl-twitch-link" title="Follow me on Twitch for more info and support!">Contact: @SirWillance</a>
                    <button class="catl-modal-collapse">${this.isCollapsed ? "+" : "-"}</button>
                    <button class="catl-modal-close">×</button>
                </div>
            </div>
            <div class="catl-modal-content-wrapper" style="display: ${this.isCollapsed ? 'none' : 'flex'}; transition: all 0.3s ease;">
                <div class="catl-operation-window">
                    <div class="catl-search-container">
                        <input type="text" class="catl-search-bar" placeholder="Search (Pro Only)" disabled />
                        <button class="catl-clear-search" disabled title="Clear Search (Pro Only)">❌</button>
                    </div>
                    <div class="catl-button-group">
                        <button title="Clear All" class="catl-clear-all">🧼</button>
                        <button title="Load (Pro Only)" class="catl-file-loader">📂</button>
                        <button title="Save" class="catl-file-saver">💾</button>
                        <button title="Tokenization (Pro Only)" class="catl-tokenize">✂</button>
                        <button title="Confirm" class="catl-confirm-input">✔</button>
                    </div>
                </div>
                ${this.getPromptCategoryTemplate("environment", "Environment", [
                    { id: "setting", label: "Setting", tooltip: "Describe the main environment or location (e.g., 'dense forest', 'cyberpunk city').", placeholder: "e.g., dense forest, cyberpunk city" },
                    { id: "structure_props", label: "Structure/Props", tooltip: "Specify buildings, objects, or props (e.g., 'wooden cabin', 'futuristic vehicles').", placeholder: "e.g., wooden cabin, futuristic vehicles" },
                    { id: "elements_lighting", label: "Elements/Lighting", tooltip: "Add weather, time of day, or lighting effects (e.g., 'sunset glow', 'rainy atmosphere').", placeholder: "e.g., sunset glow, rainy atmosphere" }
                ])}
            </div>
            <div class="catl-modal-resize-handle" style="display: ${this.isCollapsed ? 'none' : 'block'}"></div>
            <div class="catl-confirmation-popup" style="display: none; opacity: 0; transition: opacity 0.3s ease;"></div>
        `;
    }

    getPromptCategoryTemplate(promptType, promptLabel, categories) {
        let categoryHTML = '';
        categories.forEach(category => {
            const categoryId = `${promptType}-${category.id}`;
            if (this.subcategoryStates[categoryId] === undefined) {
                this.subcategoryStates[categoryId] = false;
            }
            categoryHTML += `
                <div class="catl-category-container" data-category="${categoryId}">
                    <div class="catl-category-header">
                        <label class="catl-category-label" for="${categoryId}" title="${category.tooltip || ''}">${category.label}:</label>
                        <div class="catl-category-controls">
                            <button class="catl-clear-category" data-category="${categoryId}" title="Clear this category">🧼</button>
                        </div>
                    </div>
                    <textarea 
                        id="${categoryId}" 
                        name="${categoryId}" 
                        class="catl-category-textarea" 
                        placeholder="${category.placeholder || ''}"
                        style="display:${this.subcategoryStates[categoryId] ? 'block' : 'none'}"
                    ></textarea>
                </div>
            `;
        });

        const styleNoteId = `${promptType}-style-note`;
        const styleNoteHTML = `
            <div class="catl-style-note-container" data-category="${styleNoteId}">
                <div class="catl-style-note-header">
                    <label class="catl-style-note-label">Style Emphasis Tip</label>
                </div>
                <div class="catl-style-note-content" style="display:${this.categoryStates[styleNoteId] ? 'block' : 'none'}">
                    <span class="catl-style-icon">ℹ️</span>
                    <span class="catl-style-text">
                        Including style-related terms (e.g., 'cyberpunk', 'toon') in any category will emphasize that style for the environment (e.g., a 'toon forest' or 'cyberpunk skyline').
                    </span>
                </div>
            </div>
        `;

        return `
            <div class="catl-prompt-category-container" data-prompt-type="${promptType}">
                <h3 class="catl-prompt-category-header">${promptLabel}</h3>
                <div class="catl-prompt-category-content">
                    ${styleNoteHTML}
                    ${categoryHTML}
                </div>
            </div>
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
        this.modal.classList.add(this.modalClassName, `catl-modal-${node.id || 'unknown'}`);
        this.modal.style.display = "flex";
        this.modal.style.position = "fixed";
        this.modal.style.top = "100px";
        this.modal.style.left = "100px";
        this.modal.style.backgroundColor = "#383838";
        this.modal.style.borderRadius = "12px";
        this.modal.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
        this.modal.style.zIndex = "1001";
        this.modal.style.flexDirection = "column";
        this.modal.style.width = `${this.currentWidth}px`;
        this.modal.style.height = `${this.currentHeight}px`;
        this.modal.style.overflow = "hidden";
        try {
            this.modal.innerHTML = this.getModalTemplate();
            document.body.appendChild(this.modal);
            this.loadModalState(node);
            this.setupEventHandlers(this.modal, node);
        } catch (error) {
            console.error("Error during modal creation:", error);
            throw error;
        }
        return this.modal;
    }

    setupEventHandlers(modal, node) {
        const titleBar = modal.querySelector(".catl-modal-titlebar");
        const closeButton = modal.querySelector(".catl-modal-close");
        const collapseButton = modal.querySelector(".catl-modal-collapse");
        const contentWrapper = modal.querySelector(".catl-modal-content-wrapper");
        const resizeHandle = modal.querySelector(".catl-modal-resize-handle");
        const fileLoader = modal.querySelector(".catl-file-loader");
        const fileSaver = modal.querySelector(".catl-file-saver");
        const tokenizeButton = modal.querySelector(".catl-tokenize");
        const clearAllButton = modal.querySelector(".catl-clear-all");
        const confirmInputButton = modal.querySelector(".catl-confirm-input");
        const categoryContainers = modal.querySelectorAll(".catl-prompt-category-container");
        const subcategoryContainers = modal.querySelectorAll(".catl-category-container");
        const textareas = modal.querySelectorAll(".catl-category-textarea");
        const searchInput = modal.querySelector(".catl-search-bar");

        this.setupDragHandlers(modal, titleBar);
        this.setupResizeHandle(resizeHandle);

        closeButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.saveModalState(node);
            this.close(node);
        });

        collapseButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.isCollapsed = !this.isCollapsed;
            collapseButton.textContent = this.isCollapsed ? "+" : "-";
            contentWrapper.style.display = this.isCollapsed ? "none" : "flex";
            resizeHandle.style.display = this.isCollapsed ? "none" : "block";
            const titlebarRight = modal.querySelector(".catl-modal-titlebar-right");
            titlebarRight.classList.toggle("collapsed", this.isCollapsed);
            if (this.isCollapsed) {
                const titleBarWidth = this.minimizedWidth;
                const titleBarHeight = titleBar.offsetHeight;
                this.originalWidth = this.modal.offsetWidth;
                this.originalHeight = this.modal.offsetHeight;
                this.modal.style.width = `${titleBarWidth}px`;
                this.modal.style.height = `${titleBarHeight}px`;
            } else {
                this.modal.style.width = `${this.originalWidth}px`;
                this.modal.style.height = `${this.originalHeight}px`;
            }
            this.saveModalState(node);
        });

        searchInput.addEventListener("click", (e) => {
            e.stopPropagation();
            this.showUpgradeMessage("Search Functionality");
        });

        const styleNoteContainers = modal.querySelectorAll(".catl-style-note-container");
        styleNoteContainers.forEach(container => {
            const header = container.querySelector(".catl-style-note-header");
            if (header) {
                header.addEventListener("click", (event) => {
                    event.stopPropagation();
                    const categoryId = container.dataset.category;
                    this.categoryStates[categoryId] = !this.categoryStates[categoryId];
                    const content = container.querySelector(".catl-style-note-content");
                    content.style.display = this.categoryStates[categoryId] ? "block" : "none";
                    this.saveModalState(node);
                });
            }
        });

        textareas.forEach(textarea => {
            textarea.addEventListener("input", () => {
                this.saveModalState(node);
            });

            textarea.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    event.stopPropagation();
                    const currentValue = textarea.value;
                    const selectionStart = textarea.selectionStart;
                    textarea.value = currentValue.slice(0, selectionStart) + "\n" + currentValue.slice(selectionStart);
                    textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
                    this.saveModalState(node);
                }
            });

            textarea.addEventListener("click", (event) => event.stopPropagation());
        });

        const clearCategoryButtons = modal.querySelectorAll(".catl-clear-category");
        clearCategoryButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                const categoryId = button.dataset.category;
                const textarea = modal.querySelector(`#${categoryId}`);
                if (textarea) {
                    textarea.value = "";
                    this.saveModalState(node);
                }
            });
        });

        fileLoader.addEventListener("click", (e) => {
            e.stopPropagation();
            this.showUpgradeMessage("File Loading");
        });

        fileSaver.addEventListener("click", (e) => {
            e.stopPropagation();
            this.saveFile();
        });

        tokenizeButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.showUpgradeMessage("Tokenization and Weighting");
        });

        clearAllButton.addEventListener("click", (e) => {
            e.stopPropagation();
            if (confirm("Are you sure you want to clear all?")) {
                textareas.forEach(textarea => {
                    textarea.value = "";
                });
                this.saveModalState(node);
            }
        });

        confirmInputButton.addEventListener("click", (e) => {
            e.stopPropagation();
            this.confirmInput(node);
        });

        categoryContainers.forEach(container => {
            const header = container.querySelector(".catl-prompt-category-header");
            if (header) {
                header.addEventListener("click", (event) => {
                    event.stopPropagation();
                    const promptType = container.dataset.promptType;
                    const content = container.querySelector(".catl-prompt-category-content");
                    this.categoryStates[promptType] = !this.categoryStates[promptType];
                    content.classList.toggle("collapsed", !this.categoryStates[promptType]);
                    if (this.categoryStates[promptType]) {
                        this.currentWidth = Math.min(800, window.innerWidth - 200);
                        this.currentHeight = Math.min(600, window.innerHeight - 200);
                        this.modal.style.width = `${this.currentWidth}px`;
                        this.modal.style.height = `${this.currentHeight}px`;
                    } else {
                        this.currentWidth = this.defaultWidth;
                        this.currentHeight = this.defaultHeight;
                        this.modal.style.width = `${this.currentWidth}px`;
                        this.modal.style.height = `${this.currentHeight}px`;
                    }
                    this.saveModalState(node);
                });
            }
        });

        subcategoryContainers.forEach(container => {
            const header = container.querySelector(".catl-category-header");
            if (header) {
                header.addEventListener("click", (event) => {
                    if (event.target.closest(".catl-category-textarea, .catl-clear-category")) {
                        return;
                    }
                    event.stopPropagation();
                    const categoryId = container.dataset.category;
                    const textarea = container.querySelector(".catl-category-textarea");
                    this.subcategoryStates[categoryId] = !this.subcategoryStates[categoryId];
                    textarea.style.display = this.subcategoryStates[categoryId] ? "block" : "none";
                    this.saveModalState(node);
                });
            }
        });
    }

    saveFile() {
        let textToSave = "";
        const textAreas = {
            "environment-setting": this.modal.querySelector("#environment-setting"),
            "environment-structure_props": this.modal.querySelector("#environment-structure_props"),
            "environment-elements_lighting": this.modal.querySelector("#environment-elements_lighting")
        };

        for (const key in textAreas) {
            if (textAreas[key] && textAreas[key].value.trim()) {
                textToSave += textAreas[key].value.trim() + " FoWe ";
            }
        }
        textToSave = textToSave.trim().replace(/ FoWe $/, '');
        this.downloadFile(textToSave, "Environment_Refiner_Light_Output.txt", "text/plain");
    }

    confirmInput(node) {
        if (!this.modal || !node || !node.widgets) {
            console.warn("[EnvironmentCategoryModal] confirmInput aborted: modal, node, or widgets missing");
            return;
        }

        const expectedWidgets = [
            "environment_setting",
            "environment_structure_props",
            "environment_elements_lighting"
        ];
        const missingWidgets = expectedWidgets.filter(name => !node.widgets.find(w => w.name === name));
        if (missingWidgets.length > 0) {
            console.error(`[EnvironmentCategoryModal] Missing widgets: ${missingWidgets.join(", ")} for node ${node.id}`);
            return;
        }

        console.log("[EnvironmentCategoryModal] Node state before confirm:", { id: node.id, widgets: node.widgets.map(w => ({ name: w.name, value: w.value })) });

        const textAreas = {
            "environment-setting": this.modal.querySelector("#environment-setting"),
            "environment-structure_props": this.modal.querySelector("#environment-structure_props"),
            "environment-elements_lighting": this.modal.querySelector("#environment-elements_lighting")
        };

        let combinedPrompt = "";
        const widgetValues = {};

        for (const key in textAreas) {
            if (textAreas[key] && textAreas[key].value.trim()) {
                const value = textAreas[key].value.trim();
                combinedPrompt += value + " FoWe ";
                const widgetName = `environment_${key.split('-')[1]}`;
                widgetValues[widgetName] = value;
            }
        }
        combinedPrompt = combinedPrompt.replace(/ FoWe /g, ", ").trim();
        console.log("[EnvironmentCategoryModal] Combined prompt:", combinedPrompt);

        setTimeout(() => {
            let allWidgetsFound = true;
            for (const widgetName in widgetValues) {
                const widget = node.widgets.find(w => w.name === widgetName);
                if (widget) {
                    widget.value = widgetValues[widgetName];
                    console.log(`[EnvironmentCategoryModal] Updated ${widgetName}: ${widget.value}`);
                    if (widget.callback) {
                        try {
                            console.log(`[EnvironmentCategoryModal] Calling callback for ${widgetName}`);
                            widget.callback(widget.value);
                        } catch (error) {
                            console.error(`[EnvironmentCategoryModal] Callback error for ${widgetName}:`, error);
                            allWidgetsFound = false;
                        }
                    }
                } else {
                    console.warn(`[EnvironmentCategoryModal] Widget "${widgetName}" not found for node ${node.id}.`);
                    allWidgetsFound = false;
                }
            }

            const popup = this.modal.querySelector(".catl-confirmation-popup");
            if (popup) {
                popup.textContent = allWidgetsFound ? "Input Confirmed! Proceed with your Workflow..." : "Error: Some inputs failed to update. Check console.";
                popup.style.display = "block";
                popup.style.opacity = "1";
                setTimeout(() => {
                    popup.style.opacity = "0";
                    setTimeout(() => popup.style.display = "none", 300);
                }, 4000);
            } else {
                console.warn("[EnvironmentCategoryModal] Confirmation popup not found.");
            }

            console.log("[EnvironmentCategoryModal] Confirm completed for node:", node.id);
            this.saveModalState(node);
        }, 500);
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

    saveModalState() {
        if (!this.node) return;
        const nodeData = this.getNodeData(this.node) || {};

        nodeData.currentWidth = this.currentWidth;
        nodeData.currentHeight = this.currentHeight;
        nodeData.originalWidth = this.originalWidth;
        nodeData.originalHeight = this.originalHeight;
        nodeData.isCollapsed = this.isCollapsed;
        nodeData.categoryStates = { ...this.categoryStates };
        nodeData.subcategoryStates = { ...this.subcategoryStates };

        const textareas = this.modal ? this.modal.querySelectorAll(".catl-category-textarea") : [];
        textareas.forEach(textarea => {
            nodeData[textarea.id] = textarea.value;
        });

        this.setNodeData(this.node, nodeData);
    }

    loadModalState() {
        if (!this.node) return;
        const nodeData = this.getNodeData(this.node) || {};

        this.currentWidth = nodeData.currentWidth || this.defaultWidth;
        this.currentHeight = nodeData.currentHeight || this.defaultHeight;
        this.originalWidth = nodeData.originalWidth || this.defaultWidth;
        this.originalHeight = nodeData.originalHeight || this.defaultHeight;
        this.isCollapsed = nodeData.isCollapsed || false;
        this.categoryStates = nodeData.categoryStates || { "environment": false, "environment-style-note": false };
        this.subcategoryStates = nodeData.subcategoryStates || {};

        if (this.modal) {
            this.modal.style.width = this.isCollapsed ? `${this.minimizedWidth}px` : `${this.currentWidth}px`;
            this.modal.style.height = this.isCollapsed ? `${this.minimizedHeight}px` : `${this.currentHeight}px`;

            const contentWrapper = this.modal.querySelector(".catl-modal-content-wrapper");
            const resizeHandle = this.modal.querySelector(".catl-modal-resize-handle");
            const collapseButton = this.modal.querySelector(".catl-modal-collapse");
            const titlebarRight = this.modal.querySelector(".catl-modal-titlebar-right");

            if (contentWrapper) contentWrapper.style.display = this.isCollapsed ? "none" : "flex";
            if (resizeHandle) resizeHandle.style.display = this.isCollapsed ? "none" : "block";
            if (collapseButton) collapseButton.textContent = this.isCollapsed ? "+" : "-";
            if (titlebarRight) titlebarRight.classList.toggle("collapsed", this.isCollapsed);

            const categoryContainers = this.modal.querySelectorAll(".catl-prompt-category-container");
            categoryContainers.forEach(container => {
                const promptType = container.dataset.promptType;
                const content = container.querySelector(".catl-prompt-category-content");
                if (content) content.classList.toggle("collapsed", !this.categoryStates[promptType]);
            });

            const styleNoteContainers = this.modal.querySelectorAll(".catl-style-note-container");
            styleNoteContainers.forEach(container => {
                const categoryId = container.dataset.category;
                const content = container.querySelector(".catl-style-note-content");
                if (content) content.style.display = this.categoryStates[categoryId] ? "block" : "none";
            });

            const subcategoryContainers = this.modal.querySelectorAll(".catl-category-container");
            subcategoryContainers.forEach(container => {
                const categoryId = container.dataset.category;
                const textarea = container.querySelector(".catl-category-textarea");
                if (textarea) {
                    textarea.value = nodeData[categoryId] || "";
                    textarea.style.display = this.subcategoryStates[categoryId] ? "block" : "none";
                }
            });
        }
    }

    setupDragHandlers(modal, titleBar) {
        let isDragging = false;
        let offsetX, offsetY;

        const mousemoveHandler = (e) => {
            if (!isDragging || this.isResizing) return;
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
            if (this.isCollapsed) return;
            e.preventDefault();
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = this.modal.offsetWidth;
            startHeight = this.modal.offsetHeight;
            document.addEventListener("mousemove", resizeHandler);
            document.addEventListener("mouseup", () => {
                isResizing = false;
                document.removeEventListener("mousemove", resizeHandler);
                this.currentWidth = this.modal.offsetWidth;
                this.currentHeight = this.modal.offsetHeight;
                if (this.node) this.saveModalState(this.node);
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

    close(node) {
        this.saveModalState(node);
        this.cleanup();
        if (node && node.modal === this) node.modal = null;
        this.isOpen = false;
        console.log("Modal closed. State saved for node:", node.id);
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