let cssLoaded = false;

export class BaseModal {
    constructor(config) {
        this.type = config?.type || "Default";
        this.rootKey = config?.rootKey || "styles";
        this.version = config?.version || "Alpha";
        this.modal = null;
        this.isOpen = false;
        this.modalClassName = `fow-lbm-${this.type.toLowerCase()}-modal`;
        this.selectedTokens = new Set();
        this.node = null;
        this.loadCSS();
        this.updateSelectedTokenOutputDebounced = this.debounce(this.updateSelectedTokenOutput.bind(this), 200);
        this.isResizing = false;
        this.isCollapsed = false;
        this.collapseWidth = config?.collapseWidth || "420px";
        this.expandWidth = config?.expandWidth || "420px";
        this.minHeight = 40;
        this.maxHeight = 800;
        this.rootKeyToFileMap = {};
    }

    loadCSS() {
        if (!cssLoaded) {
            const cssId = 'fow-lbm-modal-styles';
            if (!document.getElementById(cssId)) {
                const link = document.createElement('link');
                link.id = cssId;
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = new URL('./fow-lbm-styles.css', import.meta.url).href;
                document.head.appendChild(link);
                cssLoaded = true;
            }
        }
    }

    getNodeData(node) {
        if (!node) {
            console.warn("Node is undefined in getNodeData, returning empty object");
            return {};
        }
        return node.widgets_values || {};
    }

    setNodeData(node, data) {
        if (!node) {
            console.warn("Node is undefined in setNodeData, skipping");
            return;
        }
        node.widgets_values = data;
    }

    async create(node) {
        if (!node || !node.id) {
            console.error("Invalid node passed to create, aborting");
            return null;
        }
        this.node = node;
        console.log(`Opening Light ${this.type} catalogue modal for node ${node.id}...`);
        const modalId = `modal-${node.id}`;
        const modalClassName = `${this.modalClassName}-${modalId}`;

        const existingModal = document.querySelector(`.${modalClassName}`);
        if (existingModal) {
            existingModal.style.display = "flex";
            this.modal = existingModal;

            const nodeData = this.getNodeData(node);
            const savedTokens = nodeData.selectedTokens || [];
            this.selectedTokens = new Set(savedTokens);

            this.isCollapsed = nodeData.isCollapsed || false;
            const contentWrapper = this.modal.querySelector(".fow-lbm-content-wrapper");
            const resizeHandle = this.modal.querySelector(".fow-lbm-modal-resize-handle");
            if (contentWrapper) {
                contentWrapper.style.display = this.isCollapsed ? "none" : "block";
            }
            if (resizeHandle) {
                resizeHandle.style.display = this.isCollapsed ? "none" : "block";
            }

            this.updateSelectedTokenOutput();
            this.adjustModalHeight();
            return existingModal;
        }

        this.modal = document.createElement("div");
        this.modal.classList.add(modalClassName, "fow-lbm-modal");
        this.modal.style.display = "flex";
        this.modal.style.position = "fixed";
        this.modal.style.top = "100px";
        this.modal.style.left = "100px";
        this.modal.style.backgroundColor = "#383838";
        this.modal.style.borderRadius = "12px";
        this.modal.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
        this.modal.style.zIndex = "1001";
        this.modal.style.flexDirection = "column";
        this.modal.style.minHeight = `${this.minHeight}px`;
        this.modal.style.maxHeight = `${this.maxHeight}px`;
        this.modal.style.overflow = "hidden";

        this.originalWidth = this.modal.offsetWidth;
        this.originalHeight = this.modal.offsetHeight;

        const modalFragment = document.createDocumentFragment();

        const titleBar = this.createTitleBar(node.title || "Modal Title", node);
        modalFragment.appendChild(titleBar);

        const contentWrapper = document.createElement("div");
        contentWrapper.classList.add("fow-lbm-content-wrapper");
        contentWrapper.style.display = "block";
        contentWrapper.style.flexDirection = "column";

        const operationWindow = document.createElement("div");
        operationWindow.classList.add("fow-lbm-operation-window");
        operationWindow.innerHTML = `
            <input type="text" class="fow-lbm-search-bar" placeholder="Search tokens..." />
            <div class="fow-lbm-button-group">
                <button class="fow-lbm-deselect-all-button">🧼</button>
                <button class="fow-lbm-file-button">📂</button>
                <button class="fow-lbm-confirm-button">✔</button>
            </div>
        `;
        contentWrapper.appendChild(operationWindow);

        const modalContent = this.createModalContent();
        contentWrapper.appendChild(modalContent);
        modalContent.innerHTML = this.getModalTemplate();

        modalFragment.appendChild(contentWrapper);
        this.modal.appendChild(modalFragment);

        document.body.appendChild(this.modal);

        requestAnimationFrame(() => {
            this.modal.style.display = "flex";
            this.setupEventHandlers(this.modal, node);
            this.updateModalWithTokens(null, modalContent);
            this.adjustModalHeight();
        });

        const nodeData = this.getNodeData(node);
        this.isCollapsed = nodeData.isCollapsed || false;
        contentWrapper.style.display = this.isCollapsed ? "none" : "block";
        const resizeHandle = this.modal.querySelector(".fow-lbm-modal-resize-handle");
        if (resizeHandle) {
            resizeHandle.style.display = this.isCollapsed ? "none" : "block";
        }

        if (this.isCollapsed) {
            this.toggleCollapse(node);
        }

        return this.modal;
    }

    getModalTemplate() {
        return `
            <div class="fow-lbm-modal-content">
                <div class="fow-lbm-control-window">
                    <p id="fow-lbm-selected-token-output" style="white-space: pre-line;"></p>
                </div>
                <input type="file" accept=".json" style="display: none;" />
                <div class="fow-lbm-categories-container"></div>
            </div>`;
    }

    createTitleBar(title, node) {
        const titleBar = document.createElement("div");
        titleBar.classList.add("fow-lbm-modal__titlebar");

        const header = document.createElement("h3");
        header.textContent = title;
        header.style.flexGrow = "1";
        header.style.margin = "0";
        titleBar.appendChild(header);

        const collapseButton = document.createElement("button");
        collapseButton.classList.add("fow-lbm-modal__collapse");
        collapseButton.innerHTML = "-";
        collapseButton.style.marginRight = "5px";
        titleBar.appendChild(collapseButton);

        const closeButton = document.createElement("button");
        closeButton.classList.add("fow-lbm-modal__close");
        closeButton.innerHTML = "×";
        closeButton.addEventListener("click", () => {
            this.saveModalState(node);
            this.close(node);
        });
        titleBar.appendChild(closeButton);

        collapseButton.addEventListener("click", (event) => {
            event.stopPropagation();
            this.toggleCollapse(node);
        });

        return titleBar;
    }

    toggleCollapse(node) {
        const contentWrapper = this.modal.querySelector(".fow-lbm-content-wrapper");
        const resizeHandle = this.modal.querySelector(".fow-lbm-modal-resize-handle");
        const titleBar = this.modal.querySelector(".fow-lbm-modal__titlebar");

        this.isCollapsed = !this.isCollapsed;
        const isCollapsed = this.isCollapsed;

        this.setModalDimensions(isCollapsed, titleBar);

        if (contentWrapper) {
            contentWrapper.style.display = isCollapsed ? "none" : "block";
        }
        if (resizeHandle) {
            resizeHandle.style.display = isCollapsed ? "none" : "block";
        }

        const nodeData = this.getNodeData(node);
        nodeData.isCollapsed = isCollapsed;
        this.setNodeData(node, nodeData);

        const collapseButton = this.modal.querySelector(".fow-lbm-modal__collapse");
        collapseButton.innerHTML = isCollapsed ? "+" : "-";

        if (!isCollapsed) {
            this.adjustModalHeight();
        }
    }

    setModalDimensions(isCollapsed, titleBar) {
        if (isCollapsed) {
            this.modal.style.width = this.collapseWidth;
            this.modal.style.height = `${Math.max(titleBar.offsetHeight, this.minHeight)}px`;
            this.modal.style.minWidth = "0";
            this.modal.style.minHeight = "0";
        } else {
            this.modal.style.width = this.expandWidth;
            this.modal.style.height = `${this.currentHeight || this.minHeight}px`;
            this.modal.style.minWidth = "";
            this.modal.style.minHeight = "";
        }
    }

    createModalContent() {
        const modalContent = document.createElement("div");
        modalContent.classList.add("fow-lbm-modal-content");
        modalContent.style.flexGrow = "1";
        modalContent.style.overflow = "visible";
        return modalContent;
    }

    setupEventHandlers(modal, node) {
        const modalContent = modal.querySelector(".fow-lbm-modal-content");
        const operationWindow = modal.querySelector(".fow-lbm-operation-window");
        const fileInput = modal.querySelector('input[type="file"]');
        const tokensContainer = modalContent.querySelector(".fow-lbm-categories-container");

        this.setupDragHandlers(modal, modal.querySelector(".fow-lbm-modal__titlebar"));
        this.setupButtons(modal, modalContent, node, fileInput);
        this.setupFileHandlers(fileInput, modalContent);
        this.setupSearch(operationWindow);

        tokensContainer.addEventListener('click', (event) => {
            if (event.target.tagName === 'LI') {
                const tokenItem = event.target;
                const tokensList = tokenItem.closest('.fow-lbm-tokens-list');
                const value = tokenItem.textContent;
                this.toggleToken(tokenItem, value, tokensList);
            }
        });

        if (this.createResizeHandle) {
            const resizeHandle = this.createResizeHandle();
            modal.appendChild(resizeHandle);
        }

        this.adjustModalHeight();
    }

    createResizeHandle() {
        const resizeHandle = document.createElement("div");
        resizeHandle.classList.add("fow-lbm-modal-resize-handle");

        resizeHandle.addEventListener("mousedown", (e) => {
            e.preventDefault();
            if (this.isCollapsed) return;
            this.isResizing = true;

            const startWidth = this.modal.offsetWidth;
            const startHeight = this.modal.offsetHeight;
            const startX = e.clientX;
            const startY = e.clientY;

            const mousemoveHandler = (e) => {
                if (!this.isResizing) return;
                const newWidth = Math.max(startWidth + (e.clientX - startX), 200);
                const newHeight = Math.max(startHeight + (e.clientY - startY), this.minHeight);
                this.modal.style.width = `${newWidth}px`;
                this.modal.style.height = `${Math.min(newHeight, this.maxHeight)}px`;
                this.currentWidth = newWidth;
                this.currentHeight = Math.min(newHeight, this.maxHeight);
                this.originalWidth = this.currentWidth;
                this.originalHeight = this.currentHeight;
            };

            const mouseupHandler = () => {
                this.isResizing = false;
                document.removeEventListener("mousemove", mousemoveHandler);
                document.removeEventListener("mouseup", mouseupHandler);
                if (this.node) {
                    this.saveModalState(this.node);
                }
                this.adjustModalHeight();
            };

            document.addEventListener("mousemove", mousemoveHandler);
            document.addEventListener("mouseup", mouseupHandler);
        });

        return resizeHandle;
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

    setupButtons(modal, modalContent, node, fileInput) {
        modal.querySelector(".fow-lbm-file-button").onclick = () => fileInput.click();

        modal.querySelector(".fow-lbm-confirm-button").onclick = () => {
            this.updateNodeInput(node);
            this.adjustModalHeight();
            alert("Selection Confirmed. Enjoy your image 😁.");
        };

        modal.querySelector(".fow-lbm-deselect-all-button").onclick = () => {
            this.selectedTokens.clear();
            modalContent.querySelectorAll(".fow-lbm-tokens-list li").forEach(item => {
                item.classList.remove("token-enabled");
            });
            this.updateSelectedTokenOutputDebounced();
            this.adjustModalHeight();
        };

        modal.querySelector(".fow-lbm-modal__close").addEventListener("click", () => {
            this.saveModalState(node);
            this.close(node);
        });
    }

    setupFileHandlers(fileInput, modalContent) {
        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadFile(file, modalContent);
            }
            this.adjustModalHeight();
        });
    }

    setupSearch(operationWindow) { // Changed parameter to operationWindow
        const searchBar = operationWindow.querySelector(".fow-lbm-search-bar"); // Query operationWindow, not modalContent

        if (!searchBar) {
            console.error("Search bar not found in operation window!");
            return;
        }

        const performSearch = () => {
            const searchTerm = searchBar.value.trim().toLowerCase();
            const modalContent = this.modal.querySelector(".fow-lbm-modal-content"); // Get modalContent here
            const categories = modalContent.querySelectorAll(".fow-lbm-category");

            if (categories.length === 0) return;

            let hasMatches = false;

            categories.forEach(categoryElement => {
                const stylesContainer = categoryElement.querySelector(".fow-lbm-styles-container");
                const styleItems = stylesContainer.querySelectorAll(".fow-lbm-style-item");
                let categoryHasMatches = false;

                styleItems.forEach(styleItem => {
                    const label = styleItem.querySelector("label");
                    const tokensList = styleItem.querySelector(".fow-lbm-tokens-list");
                    const tokens = tokensList.querySelectorAll("li");
                    let hasMatchingTokens = false;

                    tokens.forEach(token => {
                        const tokenText = token.textContent.toLowerCase();
                        const matches = tokenText.includes(searchTerm);
                        token.style.display = matches ? "" : "none";
                        if (matches) {
                            hasMatchingTokens = true;
                            categoryHasMatches = true;
                            hasMatches = true;
                        }
                    });

                    if (hasMatchingTokens) {
                        styleItem.style.display = "";
                        tokensList.style.display = "block";
                        stylesContainer.style.display = "block";
                        label.textContent = `${label.getAttribute("data-original-name") || label.textContent} (${Array.from(tokens).filter(t => t.style.display !== "none").length})`;
                    } else {
                        styleItem.style.display = "none";
                        tokensList.style.display = "none";
                    }
                });

                categoryElement.style.display = categoryHasMatches ? "" : "none";
            });

            if (searchTerm === "") {
                categories.forEach(categoryElement => {
                    const stylesContainer = categoryElement.querySelector(".fow-lbm-styles-container");
                    const styleItems = stylesContainer.querySelectorAll(".fow-lbm-style-item");

                    categoryElement.style.display = "";
                    stylesContainer.style.display = "none";
                    styleItems.forEach(styleItem => {
                        const label = styleItem.querySelector("label");
                        const tokensList = styleItem.querySelector(".fow-lbm-tokens-list");
                        const tokens = tokensList.querySelectorAll("li");

                        styleItem.style.display = "";
                        tokensList.style.display = "none";
                        tokens.forEach(token => token.style.display = "");
                        label.textContent = label.getAttribute("data-original-name") || label.textContent;
                    });
                });
            }

            requestAnimationFrame(() => {
                this.adjustModalHeight();
            });
        };

        searchBar.addEventListener("input", () => {
            performSearch();
        });
    }

    loadFile(file, modalContent) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                this.updateModalWithTokens(jsonData, modalContent);
                this.selectedTokens.clear();
                this.updateSelectedTokenOutput();
                requestAnimationFrame(() => {
                    this.adjustModalHeight();
                });
            } catch (error) {
                console.error("Error parsing JSON:", error);
                alert("Invalid JSON file. Please ensure the file is properly formatted.");
            }
        };
        reader.readAsText(file);
    }

    updateModalWithTokens(jsonData, modalContent) {
        const categoriesContainer = modalContent.querySelector(".fow-lbm-categories-container");
        categoriesContainer.innerHTML = "";

        if (jsonData && jsonData[this.rootKey] && Array.isArray(jsonData[this.rootKey])) {
            const groupedStyles = jsonData[this.rootKey].reduce((acc, style) => {
                const category = style.category || "Uncategorized";
                acc[category] = acc[category] || [];
                acc[category].push(style);
                return acc;
            }, {});

            for (const categoryName in groupedStyles) {
                const categoryStyles = groupedStyles[categoryName];
                const categoryElement = this.createCategoryElement(categoryName, categoryStyles, jsonData, modalContent);
                categoriesContainer.appendChild(categoryElement);
            }
        } else {
            categoriesContainer.innerHTML = `
                <p style="padding: 10px;">
                    To load your catalogue, click the file loader button "📂" above.<br>
                    Navigate to your ComfyUI directory, then go to "custom_nodes" > "FoW_Suite_LIGHT" > "data" > "Library".<br>
                    Select "${this.rootKeyToFileMap[this.rootKey] || 'the matching .JSON file'}" and click Open.
                </p>`;
        }
        requestAnimationFrame(() => {
            this.adjustModalHeight();
        });
    }

    createCategoryElement(categoryName, categoryStyles, jsonData, modalContent) {
        const categoryElement = document.createElement("div");
        categoryElement.classList.add("fow-lbm-category");

        const categoryTitle = document.createElement("h4");
        categoryTitle.textContent = categoryName;
        categoryTitle.style.cursor = "pointer";
        categoryElement.appendChild(categoryTitle);

        const stylesContainer = document.createElement("div");
        stylesContainer.classList.add("fow-lbm-styles-container");
        stylesContainer.style.display = "none";

        categoryStyles.forEach(style => {
            const styleItem = this.createStyleItem(style, jsonData, modalContent);
            stylesContainer.appendChild(styleItem);
        });

        categoryElement.appendChild(stylesContainer);

        categoryTitle.addEventListener("click", () => {
            stylesContainer.style.display = stylesContainer.style.display === "none" ? "block" : "none";
            requestAnimationFrame(() => {
                this.adjustModalHeight();
            });
        });

        return categoryElement;
    }

    createStyleItem(style, jsonData, modalContent) {
        const styleItem = document.createElement("div");
        styleItem.classList.add("fow-lbm-style-item");

        const styleName = document.createElement("label");
        styleName.textContent = style.name;
        styleName.setAttribute('data-original-name', style.name);
        styleName.style.fontWeight = "bold";
        styleName.style.cursor = "pointer";
        styleName.title = style.notes || "";

        const tokensList = document.createElement("ul");
        tokensList.classList.add("fow-lbm-tokens-list");
        tokensList.style.display = "none";

        if (style.tokens && Array.isArray(style.tokens)) {
            this.createTokenItems(style, tokensList, jsonData, modalContent);
        }

        styleItem.appendChild(styleName);
        styleItem.appendChild(tokensList);

        styleName.onclick = () => this.toggleTokensList(tokensList, style, jsonData);

        return styleItem;
    }

    createTokenItems(style, tokensList, jsonData, modalContent) {
        const fragment = document.createDocumentFragment();
        style.tokens.forEach(token => {
            const tokenItem = document.createElement("li");
            tokenItem.textContent = token.value;
            tokenItem.id = `token-${token.value}`;

            if (token.tooltip) {
                tokenItem.title = token.tooltip;
            }

            if (this.selectedTokens.has(token.value)) {
                tokenItem.classList.add("token-enabled");
            }
            fragment.appendChild(tokenItem);
        });
        tokensList.appendChild(fragment);
        requestAnimationFrame(() => {
            this.adjustModalHeight();
        });
    }

    toggleToken(tokenItem, value, tokensList) {
        if (this.selectedTokens.has(value)) {
            this.selectedTokens.delete(value);
            tokenItem.classList.remove("token-enabled");
        } else {
            this.selectedTokens.add(value);
            tokenItem.classList.add("token-enabled");
        }

        this.updateSelectedTokenOutputDebounced();
        requestAnimationFrame(() => {
            this.adjustModalHeight();
        });
    }

    toggleTokensList(tokensList, style, jsonData) {
        const isExpanding = tokensList.style.display === "none";
        tokensList.style.display = isExpanding ? "block" : "none";

        if (isExpanding) {
            this.updateTokensState(tokensList, style, jsonData, true);
        } else {
            this.updateTokensState(tokensList, style, jsonData, false);
        }
        requestAnimationFrame(() => {
            this.adjustModalHeight();
        });
    }

    updateTokensState(tokensList, style, jsonData, isExpanding) {
        tokensList.querySelectorAll("li").forEach(tokenItem => {
            const tokenValue = tokenItem.textContent.trim();
            const jsonStyle = jsonData[this.rootKey].find(s => s.name === style.name);

            if (jsonStyle?.tokens) {
                const originalToken = jsonStyle.tokens.find(t => t.value === tokenValue);
                if (originalToken?.enabled) {
                    if (isExpanding) {
                        if (!this.selectedTokens.has(tokenValue)) {
                            this.selectedTokens.add(tokenValue);
                            tokenItem.classList.add("token-enabled");
                        }
                    } else {
                        if (this.selectedTokens.has(tokenValue)) {
                            this.selectedTokens.delete(tokenValue);
                            tokenItem.classList.remove("token-enabled");
                        }
                    }
                }
            }
        });
        this.updateSelectedTokenOutputDebounced();
        requestAnimationFrame(() => {
            this.adjustModalHeight();
        });
    }

    updateNodeInput(node) {
        if (!node) return;
        const selectedTokens = Array.from(this.selectedTokens);
        const userInputWidget = node.widgets.find(w => w.name === "user_input");
        if (userInputWidget) {
            userInputWidget.value = selectedTokens.join(", ");
        }
        this.saveModalState(node);
        requestAnimationFrame(() => {
            this.adjustModalHeight();
        });
    }

    saveModalState(node = this.node) {
        if (!node) {
            console.warn("No valid node to save state for, skipping");
            return;
        }
        const selectedTokens = Array.from(this.selectedTokens);
        const nodeData = this.getNodeData(node);
        nodeData.selectedTokens = selectedTokens;
        nodeData.isCollapsed = this.isCollapsed;
        nodeData.currentWidth = this.modal.offsetWidth;
        nodeData.currentHeight = this.currentHeight;
        this.setNodeData(node, nodeData);
    }

    cleanup(node) {
        if (!node) return;
        const modalId = `modal-${node.id}`;
        const modal = document.querySelector(`.${this.modalClassName}-${modalId}`);
        if (modal) modal.remove();
    }

    close(node = this.node) {
        if (this.modal) {
            this.modal.style.display = "none";
            this.isOpen = false;
            if (node) {
                this.saveModalState(node);
            }
        }
    }

    updateSelectedTokenOutput() {
        const selectedTokens = Array.from(this.selectedTokens);
        const modalContent = this.modal.querySelector(".fow-lbm-modal-content");
        if (modalContent) {
            const outputElement = modalContent.querySelector("#fow-lbm-selected-token-output");
            if (outputElement) {
                outputElement.textContent = selectedTokens.join(", ");
            }
        }
        requestAnimationFrame(() => {
            this.adjustModalHeight();
        });
    }

    adjustModalHeight() {
        if (!this.isCollapsed && this.modal) {
            const contentWrapper = this.modal.querySelector(".fow-lbm-content-wrapper");
            if (contentWrapper) {
                requestAnimationFrame(() => {
                    const contentHeight = contentWrapper.scrollHeight + 40;
                    const newHeight = Math.max(this.minHeight, Math.min(contentHeight, this.maxHeight));
                    this.currentHeight = newHeight;
                    this.modal.style.height = `${newHeight}px`;
                    if (this.node) {
                        this.saveModalState(this.node);
                    }
                });
            }
        }
    }

    debounce(func, delay) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }
}
