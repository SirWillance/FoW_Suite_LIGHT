// frontend/shared/BaseModal.js
let cssLoaded = false;

export class BaseModal {
    constructor(config = {}) {
        this.sizing = {
            minWidth: config.minWidth || 200,
            maxWidth: config.maxWidth || 1000,
            minHeight: config.minHeight || 40,
            maxHeight: config.maxHeight || 800,
            collapseWidth: config.collapseWidth || "430px",
            expandWidth: config.expandWidth || "650px"
        };
        this.type = config.type || "Default";
        this.rootKey = config.rootKey || "styles";
        this.version = config.version || "Light";
        this.modal = null;
        this.isOpen = false;
        this.nodeId = null;
        this.selectedTokens = new Set();
        this.node = null;
        this.isStateViewMode = false;
        this.isResizing = false;
        this.isCollapsed = false;
        this.isManuallyResized = false;
        this.currentWidth = null;
        this.currentHeight = null;
        this.originalWidth = this.sizing.expandWidth; // New: Store last expanded width
        this.rootKeyToFileMap = {};
        this.contactLink = null;
        this.eventListeners = [];

        this.loadCSS();
        this.updateSelectedTokenOutputDebounced = this.debounce(this.updateSelectedTokenOutput.bind(this), 200);
        this.adjustModalHeightDebounced = this.debounce(this.adjustModalHeight.bind(this), 100);
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
        return node.properties && node.properties.modalState ? JSON.parse(node.properties.modalState) : {};
    }

    setNodeData(node, data) {
        node.properties = node.properties || {};
        node.properties.modalState = JSON.stringify(data);
    }

    create(node) {
        if (!node || !node.id) return null;
        this.node = node;
        this.nodeId = node.id;
        const modalId = `modal-${node.id}`;
        const modalClassName = `fow-lbm-${this.type.toLowerCase()}-modal-${modalId}`;

        const existingModal = document.querySelector(`.${modalClassName}`);
        if (existingModal) {
            this.reuseExistingModal(existingModal, node);
            return existingModal;
        }

        this.modal = document.createElement("div");
        this.modal.classList.add(modalClassName, "fow-lbm-modal");
        this.modal.dataset.nodeId = node.id;
        this.setupModalStructure();
        this.appendModalContent(node);

        document.body.appendChild(this.modal);
        console.log(`Node ${this.nodeId} modal created`);
        this.initializeModal(node);

        return this.modal;
    }

    reuseExistingModal(existingModal, node) {
        this.modal = existingModal;
        this.nodeId = node.id;
        this.node = node;
        const nodeData = this.getNodeData(node);
        this.selectedTokens = new Set(nodeData.selectedTokens || []);
        this.isCollapsed = nodeData.isCollapsed || false;
        this.currentWidth = nodeData.currentWidth || this.sizing.expandWidth;
        this.originalWidth = nodeData.originalWidth || this.sizing.expandWidth; // Load saved original
        this.currentHeight = nodeData.currentHeight || this.sizing.minHeight;
        this.isManuallyResized = nodeData.isManuallyResized || false;
    
        this.modal.style.display = "flex";
        this.isOpen = true;
        this.setupEventHandlers(this.modal, node);
        const contentWrapper = this.modal.querySelector(".fow-lbm-content-wrapper");
        const resizeHandle = this.modal.querySelector(".fow-lbm-modal-resize-handle");
        if (contentWrapper) contentWrapper.style.display = this.isCollapsed ? "none" : "block";
        if (resizeHandle) resizeHandle.style.display = this.isCollapsed ? "none" : "block";
    
        this.updateSelectedTokenOutput();
        this.adjustModalHeightDebounced();
    }

    setupModalStructure() {
        this.modal.style.position = "fixed";
        this.modal.style.top = "100px";
        this.modal.style.left = "100px";
        this.modal.style.zIndex = "1001";
        this.modal.style.overflow = "hidden";
        this.modal.style.minWidth = `${this.sizing.minWidth}px`;
        this.modal.style.maxWidth = `${this.sizing.maxWidth}px`;
        this.modal.style.minHeight = `${this.sizing.minHeight}px`;
        this.modal.style.maxHeight = `${this.sizing.maxHeight}px`;
    }

    appendModalContent(node) {
        const modalFragment = document.createDocumentFragment();
        const titleBar = this.createTitleBar(node.title || "Modal Title", node);
        modalFragment.appendChild(titleBar);

        const contentWrapper = document.createElement("div");
        contentWrapper.classList.add("fow-lbm-content-wrapper");
        contentWrapper.style.flexDirection = "column";
        this.appendOperationWindow(contentWrapper);
        this.appendModalContentElements(contentWrapper, node);

        modalFragment.appendChild(contentWrapper);
        this.modal.appendChild(modalFragment);
    }

    appendOperationWindow(contentWrapper) {
        const operationWindow = document.createElement("div");
        operationWindow.classList.add("fow-lbm-operation-window");
        operationWindow.innerHTML = `
            <input type="text" class="fow-lbm-search-bar" placeholder="Search tokens..." />
            <div class="fow-lbm-button-group">
                <button class="fow-lbm-deselect-all-button" title="Deselect All Tokens">🧼</button>
                <button class="fow-lbm-file-button" title="Toggle Selection Path View">👀</button>
                <button class="fow-lbm-confirm-button" title="Confirm Selection">✔</button>
            </div>
        `;
        contentWrapper.appendChild(operationWindow);
    }

    appendModalContentElements(contentWrapper, node) {
        const modalContent = this.createModalContent();
        contentWrapper.appendChild(modalContent);
        modalContent.innerHTML = this.getModalTemplate();

        const fileInput = modalContent.querySelector('input[type="file"]');
        this.setupFileHandlers(fileInput, modalContent);
    }

    getModalTemplate() {
        return `
            <div class="fow-lbm-control-window">
                <p id="fow-lbm-selected-token-output" style="white-space: pre-line;"></p>
            </div>
            <input type="file" accept=".json" style="display: none;" />
            <div class="fow-lbm-categories-container"></div>
        `;
    }

    initializeModal(node) {
        const defaultCatalogueWidget = node.widgets.find(w => w.name === "default_catalogue");
        let defaultCatalogue = defaultCatalogueWidget?.value;
        console.log(`Node ${this.nodeId} default_catalogue:`, defaultCatalogue);
        if (typeof defaultCatalogue === "string") {
            try {
                const parsedData = JSON.parse(defaultCatalogue);
                console.log(`Node ${this.nodeId} parsed default_catalogue:`, parsedData);
                defaultCatalogue = parsedData.catalogue || parsedData;
            } catch (error) {
                console.error(`Node ${this.nodeId} error parsing default_catalogue:`, error);
                defaultCatalogue = null;
            }
        }

        this.modal.style.display = "flex";
        this.isOpen = true;
        this.setupEventHandlers(this.modal, node);
        this.updateModalWithTokens(defaultCatalogue, this.modal.querySelector(".fow-lbm-modal-content"));
        this.adjustModalHeightDebounced();
    }

    createTitleBar(title, node) {
        const titleBar = document.createElement("div");
        titleBar.classList.add("fow-lbm-modal__titlebar");

        const header = document.createElement("h3");
        header.textContent = title;
        header.style.flexGrow = "1";
        header.style.margin = "0";
        titleBar.appendChild(header);

        this.contactLink = document.createElement("a");
        this.contactLink.textContent = "Contact: @SirWillance";
        this.contactLink.href = "https://www.twitch.tv/sirwillance/about";
        this.contactLink.target = "_blank";
        this.contactLink.rel = "noopener noreferrer";
        this.contactLink.style.cursor = "pointer";
        this.contactLink.addEventListener("click", (e) => e.stopPropagation());
        titleBar.appendChild(this.contactLink);

        const collapseButton = document.createElement("button");
        collapseButton.classList.add("fow-lbm-modal__collapse");
        collapseButton.innerHTML = "-";
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

    // --- Event Handling ---
    setupEventHandlers(modal, node) {
        const modalContent = modal.querySelector(".fow-lbm-modal-content");
        const operationWindow = modal.querySelector(".fow-lbm-operation-window");
        const fileInput = modal.querySelector('input[type="file"]');
        const tokensContainer = modalContent.querySelector(".fow-lbm-categories-container");

        this.cleanupEventListeners();
        this.setupDragHandlers(modal, modal.querySelector(".fow-lbm-modal__titlebar"));
        if (this.createResizeHandle) {
            const resizeHandle = this.createResizeHandle();
            modal.appendChild(resizeHandle);
        }
        this.setupButtons(modal, modalContent, node, fileInput);
        this.setupSearch(operationWindow);

        const tokenClickHandler = (event) => {
            if (event.target.tagName === 'LI') {
                const tokenItem = event.target;
                const tokensList = tokenItem.closest('.fow-lbm-tokens-list');
                const value = tokenItem.textContent;
                this.toggleToken(tokenItem, value, tokensList);
            }
        };
        tokensContainer.addEventListener('click', tokenClickHandler);
        this.eventListeners.push({ element: tokensContainer, type: 'click', handler: tokenClickHandler });

        this.adjustModalHeightDebounced();
    }

    cleanupEventListeners() {
        this.eventListeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler);
        });
        this.eventListeners = [];
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
            e.preventDefault();
            isDragging = true;
            offsetX = e.clientX - modal.offsetLeft;
            offsetY = e.clientY - modal.offsetTop;
            document.addEventListener("mousemove", mousemoveHandler);
            document.addEventListener("mouseup", mouseupHandler);
        });
    }

    createResizeHandle() {
        const resizeHandle = document.createElement("div");
        resizeHandle.classList.add("fow-lbm-modal-resize-handle");
    
        resizeHandle.addEventListener("mousedown", (e) => {
            e.preventDefault();
            if (this.isCollapsed) return;
            this.isResizing = true;
            this.isManuallyResized = true;
    
            const startWidth = this.modal.offsetWidth;
            const startHeight = this.modal.offsetHeight;
            const startX = e.clientX;
            const startY = e.clientY;
    
            const mousemoveHandler = (e) => {
                if (!this.isResizing) return;
                const newWidth = Math.max(this.sizing.minWidth, Math.min(startWidth + (e.clientX - startX), this.sizing.maxWidth));
                const newHeight = Math.max(this.sizing.minHeight, Math.min(startHeight + (e.clientY - startY), this.sizing.maxHeight));
                this.modal.style.width = `${newWidth}px`;
                this.modal.style.height = `${newHeight}px`;
                this.currentWidth = `${newWidth}px`; // Update current
                this.originalWidth = `${newWidth}px`; // Update original
                this.currentHeight = newHeight;
                this.adjustModalHeightDebounced();
            };
    
            const mouseupHandler = () => {
                this.isResizing = false;
                document.removeEventListener("mousemove", mousemoveHandler);
                document.removeEventListener("mouseup", mouseupHandler);
                if (this.node) this.saveModalState(this.node);
                this.adjustModalHeightDebounced();
            };
    
            document.addEventListener("mousemove", mousemoveHandler);
            document.addEventListener("mouseup", mouseupHandler);
        });
    
        return resizeHandle;
    }

    setupButtons(modal, modalContent, node, fileInput) {
        const deselectButton = modal.querySelector(".fow-lbm-deselect-all-button");
        deselectButton.onclick = () => this.showPopup({
            message: "Are you sure you want to deselect all tokens?",
            buttons: [
                { text: "Yes", onClick: () => this.deselectAllTokens(modalContent) },
                { text: "No", onClick: () => {} }
            ]
        });

        const fileButton = modal.querySelector(".fow-lbm-file-button");
        fileButton.onclick = () => {
            this.toggleStateViewMode(modalContent);
        };

        const confirmButton = modal.querySelector(".fow-lbm-confirm-button");
        confirmButton.onclick = () => this.showPopup({
            message: "Are you sure you want to confirm your selection?",
            buttons: [
                { text: "Yes", onClick: () => this.confirmSelection(node) },
                { text: "No", onClick: () => {} }
            ]
        });
    }

    // --- Token and Style Management ---
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
            this.adjustModalHeightDebounced();
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
            tokenItem.title = token.tooltip || "";

            if (this.selectedTokens.has(token.value)) {
                tokenItem.classList.add("token-enabled");
            }
            fragment.appendChild(tokenItem);
        });
        tokensList.appendChild(fragment);
        this.adjustModalHeightDebounced();
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
        this.adjustModalHeightDebounced();
    }

    toggleTokensList(tokensList, style, jsonData) {
        const isExpanding = tokensList.style.display === "none";
        tokensList.style.display = isExpanding ? "block" : "none";

        if (isExpanding) {
            this.updateTokensState(tokensList, style, jsonData, true);
        } else {
            this.updateTokensState(tokensList, style, jsonData, false);
        }
        this.adjustModalHeightDebounced();
    }

    updateTokensState(tokensList, style, jsonData, isExpanding) {
        tokensList.querySelectorAll("li").forEach(tokenItem => {
            const tokenValue = tokenItem.textContent.trim();
            const jsonStyle = jsonData[this.rootKey].find(s => s.name === style.name);

            if (jsonStyle?.tokens) {
                const originalToken = jsonStyle.tokens.find(t => t.value === tokenValue);
                if (originalToken?.enabled) {
                    if (isExpanding && !this.selectedTokens.has(tokenValue)) {
                        this.selectedTokens.add(tokenValue);
                        tokenItem.classList.add("token-enabled");
                    } else if (!isExpanding && this.selectedTokens.has(tokenValue)) {
                        this.selectedTokens.delete(tokenValue);
                        tokenItem.classList.remove("token-enabled");
                    }
                }
            }
        });
        this.updateSelectedTokenOutputDebounced();
        this.adjustModalHeightDebounced();
    }

    // --- File and Search Handling ---
    setupFileHandlers(fileInput, modalContent) {
        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) this.loadFile(file, modalContent);
            this.adjustModalHeightDebounced();
        });
    }

    setupSearch(operationWindow) {
        const searchBar = operationWindow.querySelector(".fow-lbm-search-bar");
        if (!searchBar) {
            console.error("Search bar not found in operation window!");
            return;
        }

        const performSearch = () => {
            const searchTerm = searchBar.value.trim().toLowerCase();
            const modalContent = this.modal.querySelector(".fow-lbm-modal-content");
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

            this.adjustModalHeightDebounced();
        };

        searchBar.addEventListener("input", performSearch);
    }

    loadFile(file, modalContent) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                this.updateModalWithTokens(jsonData, modalContent);
                this.selectedTokens.clear();
                this.updateSelectedTokenOutput();
                this.adjustModalHeightDebounced();
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

                const stylesContainer = categoryElement.querySelector(".fow-lbm-styles-container");
                const styleItems = stylesContainer.querySelectorAll(".fow-lbm-style-item");
                let hasSelectedTokensInCategory = false;

                styleItems.forEach(styleItem => {
                    const tokensList = styleItem.querySelector(".fow-lbm-tokens-list");
                    const tokens = tokensList.querySelectorAll("li");
                    let hasSelectedTokensInStyle = false;

                    tokens.forEach(token => {
                        const tokenValue = token.textContent.trim();
                        const isSelected = this.selectedTokens.has(tokenValue);

                        if (this.isStateViewMode) {
                            token.style.display = "none"; // Initially hide in state view mode (handled by toggleStateViewMode)
                        } else {
                            token.style.display = "";
                            if (isSelected) hasSelectedTokensInStyle = true;
                        }
                    });

                    if (this.isStateViewMode) {
                        styleItem.style.display = "none";
                        tokensList.style.display = "none";
                    }

                    if (hasSelectedTokensInStyle) {
                        hasSelectedTokensInCategory = true;
                    }
                });

                if (!this.isStateViewMode || hasSelectedTokensInCategory) {
                    categoriesContainer.appendChild(categoryElement);
                }
            }
        } else {
            categoriesContainer.innerHTML = `
                <p style="padding: 10px;">
                    To load your catalogue, click the file loader button "👀" above.<br>
                    Navigate to your ComfyUI directory, then go to "custom_nodes" > "FoW_Suite_LIGHT" > "data" > "Library".<br>
                    Select "${this.rootKeyToFileMap[this.rootKey] || 'the matching .JSON file'}" and click Open.
                </p>`;
        }
        this.adjustModalHeightDebounced();
    }

    // --- State and UI Management ---
    toggleCollapse(node) {
        if (!this.modal) {
            console.warn("Modal not initialized, cannot toggle collapse");
            return;
        }
    
        const contentWrapper = this.modal.querySelector(".fow-lbm-content-wrapper");
        const resizeHandle = this.modal.querySelector(".fow-lbm-modal-resize-handle");
        const titleBar = this.modal.querySelector(".fow-lbm-modal__titlebar");
        const collapseButton = this.modal.querySelector(".fow-lbm-modal__collapse");
    
        if (!this.isCollapsed && this.isManuallyResized) {
            this.originalWidth = `${this.modal.offsetWidth}px`; // Save pre-collapse width
        }
    
        this.isCollapsed = !this.isCollapsed;
    
        if (this.isCollapsed) {
            this.currentWidth = this.sizing.collapseWidth; // Collapse to fixed width
        } else {
            this.currentWidth = this.originalWidth; // Restore last expanded width
        }
        this.setModalDimensions(this.isCollapsed, titleBar);
    
        if (contentWrapper) contentWrapper.style.display = this.isCollapsed ? "none" : "block";
        if (resizeHandle) resizeHandle.style.display = this.isCollapsed ? "none" : "block";
        if (this.contactLink) this.contactLink.style.display = this.isCollapsed ? "none" : "inline";
        if (collapseButton) collapseButton.innerHTML = this.isCollapsed ? "+" : "-";
    
        this.saveModalState(node);
    
        if (!this.isCollapsed) this.adjustModalHeightDebounced();
    }

    setModalDimensions(isCollapsed, titleBar) {
        const titleBarHeight = titleBar?.offsetHeight || this.sizing.minHeight;
        if (isCollapsed) {
            this.modal.style.width = this.sizing.collapseWidth; // Fixed collapse width
            this.modal.style.height = `${Math.max(titleBarHeight, this.sizing.minHeight)}px`;
            this.modal.style.minWidth = "0";
            this.modal.style.minHeight = "0";
        } else {
            this.modal.style.width = this.currentWidth || this.sizing.expandWidth; // Use saved width
            this.modal.style.height = `${this.currentHeight || this.sizing.minHeight}px`;
            this.modal.style.minWidth = `${this.sizing.minWidth}px`;
            this.modal.style.minHeight = `${this.sizing.minHeight}px`;
        }
    }

    createModalContent() {
        const modalContent = document.createElement("div");
        modalContent.classList.add("fow-lbm-modal-content");
        modalContent.style.flexGrow = "1";
        modalContent.style.overflow = "auto";
        return modalContent;
    }

    toggleStateViewMode(modalContent) {
        this.isStateViewMode = !this.isStateViewMode;
        const categoriesContainer = modalContent.querySelector(".fow-lbm-categories-container");

        if (this.isStateViewMode) {
            const renderedTokens = new Set(); // Always deduplicate in state view mode

            const categories = categoriesContainer.querySelectorAll(".fow-lbm-category");
            categories.forEach(categoryElement => {
                const categoryTitle = categoryElement.querySelector("h4");
                const stylesContainer = categoryElement.querySelector(".fow-lbm-styles-container");
                let categoryHasSelected = false;

                const styleItems = stylesContainer.querySelectorAll(".fow-lbm-style-item");
                styleItems.forEach(styleItem => {
                    const tokensList = styleItem.querySelector(".fow-lbm-tokens-list");
                    const tokens = tokensList.querySelectorAll("li");
                    let hasSelectedTokens = false;

                    tokens.forEach(token => {
                        const tokenValue = token.textContent.trim();
                        const isSelected = this.selectedTokens.has(tokenValue);

                        if (isSelected && !renderedTokens.has(tokenValue)) {
                            token.style.display = "";
                            renderedTokens.add(tokenValue);
                            hasSelectedTokens = true;
                        } else {
                            token.style.display = "none";
                        }
                    });

                    if (hasSelectedTokens) {
                        styleItem.style.display = "";
                        tokensList.style.display = "block";
                        categoryHasSelected = true;
                        styleItem.classList.add("fow-lbm-style-item--selected");
                    } else {
                        styleItem.style.display = "none";
                        tokensList.style.display = "none";
                        styleItem.classList.remove("fow-lbm-style-item--selected");
                    }
                });

                if (categoryHasSelected) {
                    categoryElement.style.display = "";
                    stylesContainer.style.display = "block";
                } else {
                    categoryElement.style.display = "none";
                    stylesContainer.style.display = "none";
                }
            });
        } else {
            const categories = categoriesContainer.querySelectorAll(".fow-lbm-category");
            categories.forEach(categoryElement => {
                const stylesContainer = categoryElement.querySelector(".fow-lbm-styles-container");
                const styleItems = stylesContainer.querySelectorAll(".fow-lbm-style-item");

                categoryElement.style.display = "";
                stylesContainer.style.display = "none";

                styleItems.forEach(styleItem => {
                    const tokensList = styleItem.querySelector(".fow-lbm-tokens-list");
                    const tokens = tokensList.querySelectorAll("li");

                    styleItem.style.display = "";
                    tokensList.style.display = "none";
                    styleItem.classList.remove("fow-lbm-style-item--selected");
                    tokens.forEach(token => token.style.display = "");
                });
            });
        }

        this.adjustModalHeightDebounced();
    }

    // --- State Management ---
    deselectAllTokens(modalContent) {
        this.selectedTokens.clear();
        modalContent.querySelectorAll(".fow-lbm-tokens-list li").forEach(item => {
            item.classList.remove("token-enabled");
        });
        this.updateSelectedTokenOutputDebounced();
        this.adjustModalHeightDebounced();
    }

    confirmSelection(node) {
        this.updateNodeInput(node);
        this.adjustModalHeightDebounced();
        this.showConfirmation("Selection Confirmed. Enjoy your image 😁.");
    }

    updateNodeInput(node) {
        if (!node) return;
        const selectedTokens = Array.from(this.selectedTokens);
        const userInputWidget = node.widgets.find(w => w.name === "user_input");
        if (userInputWidget) userInputWidget.value = selectedTokens.join(", ");
        this.saveModalState(node);
        this.adjustModalHeightDebounced();
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
        nodeData.currentWidth = this.currentWidth;
        nodeData.originalWidth = this.originalWidth; // New: Save original width
        nodeData.currentHeight = this.currentHeight;
        nodeData.isManuallyResized = this.isManuallyResized;
        this.setNodeData(node, nodeData);
    }

    close(node = this.node) {
        if (this.modal && this.nodeId === node.id) {
            console.log(`Node ${this.nodeId} modal closed`);
            this.modal.style.display = "none";
            this.isOpen = false;
            this.cleanupEventListeners(); // Clean listeners on close
            this.saveModalState(node);
        } else {
            console.warn(`Close called on mismatched node ID: ${node.id}, expected ${this.nodeId}`);
        }
    }

    cleanup(node) {
        if (!node || !this.modal || this.nodeId !== node.id) return;
        console.log(`Cleaning up modal for node ${this.nodeId}`);
        this.cleanupEventListeners();
        this.modal.remove();
        this.modal = null;
        this.node = null;
        this.nodeId = null;
        this.selectedTokens.clear(); // Reset state
    }

    updateSelectedTokenOutput() {
        const selectedTokens = Array.from(this.selectedTokens);
        const modalContent = this.modal.querySelector(".fow-lbm-modal-content");
        if (modalContent) {
            const outputElement = modalContent.querySelector("#fow-lbm-selected-token-output");
            if (outputElement) outputElement.textContent = selectedTokens.join(", ");
        }
        this.adjustModalHeightDebounced();
    }

    adjustModalHeight() {
        if (!this.isCollapsed && this.modal) {
            const contentWrapper = this.modal.querySelector(".fow-lbm-content-wrapper");
            if (contentWrapper) {
                const contentHeight = contentWrapper.scrollHeight + 40;
               
                let newHeight = this.currentHeight || this.sizing.minHeight;

                if (this.isManuallyResized) {
                    // Only adjust upward if content exceeds current height
                    if (contentHeight > this.currentHeight) {
                        newHeight = Math.min(contentHeight, this.sizing.maxHeight);
                    }
                    // Don't shrink automatically to avoid snap-back
                } else {
                    newHeight = Math.max(this.sizing.minHeight, Math.min(contentHeight, this.sizing.maxHeight));
                }

                if (newHeight !== this.currentHeight) {
                    this.currentHeight = newHeight;
                    this.modal.style.height = `${newHeight}px`;
                    if (this.node) this.saveModalState(this.node);
                }
            }
        }
    }

    // --- Utility Methods ---
    debounce(func, delay) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    showPopup({ message, buttons = [], showToggle = false, toggleText = "", toggleState = false, onToggleChange = () => {} }) {
        const popup = document.createElement("div");
        popup.className = "fow-lbm-popup fow-lbm-popup-warning";
        popup.style.zIndex = "1003";
        popup.style.opacity = "0";
        popup.style.transition = "opacity 0.3s ease";

        const messageEl = document.createElement("div");
        messageEl.className = "fow-lbm-popup-message";
        messageEl.innerHTML = message;
        messageEl.style.marginBottom = "20px";
        messageEl.style.padding = "0 20px";
        popup.appendChild(messageEl);

        if (showToggle) {
            const toggleContainer = document.createElement("div");
            toggleContainer.className = "fow-lbm-popup-toggle";
            toggleContainer.style.marginBottom = "20px";
            const toggleInput = document.createElement("input");
            toggleInput.type = "checkbox";
            toggleInput.id = `fow-lbm-toggle-${Date.now()}`;
            toggleInput.checked = toggleState;
            toggleInput.onchange = (e) => onToggleChange(e.target.checked);
            const toggleLabel = document.createElement("label");
            toggleLabel.htmlFor = toggleInput.id;
            toggleLabel.textContent = toggleText;
            toggleLabel.style.marginLeft = "5px";
            toggleContainer.append(toggleInput, toggleLabel);
            popup.appendChild(toggleContainer);
        }

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "fow-lbm-popup-buttons";
        buttonContainer.style.display = "flex";
        buttonContainer.style.gap = "15px";
        buttonContainer.style.justifyContent = "center";
        buttons.forEach(btn => {
            const button = document.createElement("button");
            button.className = btn.text === "No" ? "fow-lbm-popup-cancel-button" : "fow-lbm-popup-button";
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
            popup.style.backgroundColor = "#444";
            popup.style.padding = "30px";
            popup.style.width = "450px";
            popup.style.minHeight = "150px";
            popup.style.borderRadius = "12px";
            popup.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.4)";
            popup.style.color = "#fff";
            popup.style.textAlign = "center";
        });
    }

    showConfirmation(message, duration = 2000) {
        const confirmation = document.createElement("div");
        confirmation.className = "fow-lbm-confirmation-popup";
        confirmation.style.zIndex = "1002";
        confirmation.style.opacity = "0";
        confirmation.style.transition = "opacity 0.3s ease";

        confirmation.innerHTML = message;
        document.body.appendChild(confirmation);
        requestAnimationFrame(() => {
            confirmation.style.opacity = "1";
            confirmation.style.position = "fixed";
            confirmation.style.top = "20px";
            confirmation.style.left = "50%";
            confirmation.style.transform = "translateX(-50%)";
            confirmation.style.backgroundColor = "#127015";
            confirmation.style.color = "#fff";
            confirmation.style.padding = "10px 20px";
            confirmation.style.borderRadius = "5px";
            confirmation.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";
            confirmation.style.fontSize = "14px";
        });

        setTimeout(() => {
            confirmation.style.opacity = "0";
            setTimeout(() => confirmation.remove(), 300);
        }, duration);
    }
}
