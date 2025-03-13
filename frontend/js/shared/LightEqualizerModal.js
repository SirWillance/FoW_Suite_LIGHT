export class LightEqualizerModal {
    constructor(node, prompt) {
        this.node = node;
        this.isCollapsed = false;
        this.defaultWidth = 590;
        this.defaultHeight = 260;
        this.minWidth = 420;
        this.minHeight = 40;
        this.maxHeight = 940;
        this.maxWidth = 1000;
        this.currentWidth = this.defaultWidth;
        this.currentHeight = this.defaultHeight;
        this.startWidth = 0;
        this.startHeight = 0;
        this.startX = 0;
        this.startY = 0;
        this.isResizing = false;
        this.itemSpacing = 40;
        this.maxTokens = 5; // Light version: 5 tokens max
        this.tokens = [];
        this.weights = [];
        this.sliders = [];
        this.prompt = prompt || "";
        this.anchoredStates = [];
        this.sectionStates = {
            settings: false,
            sliders: false,
            promptAndTokens: false
        };
        this.rangeOptions = [
            { label: "0-2", min: 0, max: 2 },
            { label: "-1-5", min: -1, max: 5 },
            { label: "-2-10", min: -2, max: 10 }
        ];
        this.currentRange = this.rangeOptions[0]; // Default to 0-2 internally
        this.modeOptions = [
            { label: "Standard", value: "standard" },
            { label: "Normalized", value: "normalized" },
            { label: "Experimental", value: "experimental" }
        ];
        this.currentMode = "standard"; // Default to Standard internally
        this.ruleOptions = [
            { label: "None", apply: null },
            { label: "Equal", apply: null },
            { label: "Exponential", apply: null },
            { label: "Buffer", apply: null }
        ];
        this.currentRule = this.ruleOptions[0]; // Default to None internally
        this.suppressClearWarning = false;
        this.suppressClearSuccess = false;
        this.showPromptInPopup = false;
        this.hasShownWeightWarning = false;
        this.hasShownTokenWarning = false;

        this.createModal();
        this.loadCSS();
        this.tokenize(this.prompt);
        this.updateTokensAndSliders(this.prompt);
    }

    loadCSS() {
        const cssId = "leq-modal-styles";
        if (!document.getElementById(cssId)) {
            const link = document.createElement("link");
            link.id = cssId;
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = new URL("./leqm.css", import.meta.url).href;
            document.head.appendChild(link);
            console.log(`Loaded CSS for ${cssId} at ${link.href}`);
        }
    }

    createModal() {
        // Reset warning flags on modal creation
        this.hasShownWeightWarning = false;
        this.hasShownTokenWarning = false;

        const existingModal = document.getElementById(`leq-modal-${this.node.id}`);
        if (existingModal) {
            existingModal.remove();
        }

        this.modal = document.createElement("div");
        this.modal.className = "leq--modal";
        this.modal.id = `leq-modal-${this.node.id}`;

        const titlebar = document.createElement("div");
        titlebar.className = "leq--modal__titlebar";
        const title = document.createElement("h3");
        title.textContent = this.node.title || "Text Equalizer Light";
        title.title = "Text Equalizer Light: Adjust token weights for your prompt (Free Tier).";

        this.contactLink = document.createElement("a");
        this.contactLink.href = "https://www.twitch.tv/sirwillance/about";
        this.contactLink.target = "_blank";
        this.contactLink.className = "leq--contact-link";
        this.contactLink.textContent = "Contact: @SirWillance";
        this.contactLink.title = "Follow me on Twitch for more info and support!";
        this.contactLink.style.marginRight = "10px";

        const collapseBtn = document.createElement("button");
        collapseBtn.className = "leq--modal__collapse";
        collapseBtn.textContent = this.isCollapsed ? "+" : "-";
        collapseBtn.title = this.isCollapsed ? "Expand the modal" : "Collapse the modal";
        collapseBtn.onclick = () => this.toggleCollapse();

        const closeBtn = document.createElement("button");
        closeBtn.className = "leq--modal__close";
        closeBtn.textContent = "×";
        closeBtn.title = "Close the modal";
        closeBtn.onclick = () => this.close();
        titlebar.append(title, this.contactLink, collapseBtn, closeBtn);

        const contentWrapper = document.createElement("div");
        contentWrapper.className = "leq--modal-content-wrapper";
        contentWrapper.style.display = this.isCollapsed ? "none" : "flex";
        contentWrapper.style.flexDirection = "column";
        contentWrapper.style.overflow = "auto";
        contentWrapper.style.padding = "10px";
        contentWrapper.style.backgroundColor = "#333333";
        contentWrapper.style.flexGrow = "1";

        const mainContent = document.createElement("div");
        mainContent.className = "leq--main-content";
        mainContent.style.flexGrow = "1";
        mainContent.style.overflowY = "auto";

        const settingsSection = document.createElement("div");
        settingsSection.className = "leq--collapsible-section";
        settingsSection.dataset.section = "settings";
        const settingsHeader = document.createElement("div");
        settingsHeader.className = "leq--collapsible-header";
        settingsHeader.textContent = "⚙️ Settings";
        settingsHeader.title = "Configure range, mode, and rules for sliders (Light version)";
        const settingsContent = document.createElement("div");
        settingsContent.className = "leq--collapsible-content";
        settingsContent.style.display = "none";

        const operationWindow = document.createElement("div");
        operationWindow.className = "leq--operation-window";
        operationWindow.style.display = "flex";
        operationWindow.style.flexDirection = "column";
        operationWindow.style.justifyContent = "space-between";
        operationWindow.style.alignItems = "center";

        const buttonsContainer = document.createElement("div");
        buttonsContainer.style.display = "flex";
        buttonsContainer.style.gap = "0px";
        buttonsContainer.style.marginBottom = "5px";

        const clearButton = document.createElement("button");
        clearButton.className = "leq--clear-button";
        clearButton.textContent = "🧼";
        clearButton.title = "Clear all prompts and tokens";
        clearButton.onclick = () => this.clearAllHandler();

        const undoWrapper = document.createElement("div");
        undoWrapper.className = "leq--button-wrapper";
        const undoButton = document.createElement("button");
        undoButton.className = "leq--undo-button";
        undoButton.textContent = "↶";
        undoButton.title = "Undo the last change (Standard/Pro feature)";
        undoWrapper.appendChild(undoButton);
        undoWrapper.onclick = (e) => {
            e.preventDefault();
            this.showUpgradePopup("Undo/Redo Functionality", "UndoRedoPopup", "Reverts your last action.");
        };

        const resetButton = document.createElement("button");
        resetButton.className = "leq--reset-button";
        resetButton.textContent = "♻";
        resetButton.title = "Reset all weights to 1.0";
        resetButton.onclick = () => this.resetWeights();

        const redoWrapper = document.createElement("div");
        redoWrapper.className = "leq--button-wrapper";
        const redoButton = document.createElement("button");
        redoButton.className = "leq--redo-button";
        redoButton.textContent = "↷";
        redoButton.title = "Redo the last undone change (Standard/Pro feature)";
        redoWrapper.appendChild(redoButton);
        redoWrapper.onclick = (e) => {
            e.preventDefault();
            this.showUpgradePopup("Undo/Redo Functionality", "UndoRedoPopup", "Re-applies your last undone action.");
        };

        const confirmButton = document.createElement("button");
        confirmButton.className = "leq--confirm-button";
        confirmButton.textContent = "✔";
        confirmButton.title = "Apply changes and update the prompt";
        confirmButton.onclick = () => this.confirmChanges();
        buttonsContainer.append(clearButton, undoWrapper, resetButton, redoWrapper, confirmButton);

        const dropdownsContainer = document.createElement("div");
        dropdownsContainer.style.display = "flex";
        dropdownsContainer.style.gap = "10px";
        dropdownsContainer.style.marginBottom = "5px";

        const rangeDropdown = document.createElement("select");
        rangeDropdown.className = "leq--dropdown";
        rangeDropdown.title = "Set the range for slider values (0-2 only in Light version)";
        rangeDropdown.innerHTML = `<option value="" selected>Range</option>` +
            this.rangeOptions.map(option => `<option value="${option.label}"> ${option.label}</option>`).join('');
        rangeDropdown.value = ""; // Default to "Range"
        rangeDropdown.onchange = () => {
            const selectedLabel = rangeDropdown.value;
            if (selectedLabel && selectedLabel !== "0-2") {
                this.showUpgradePopup("Custom Range", "CustomRangePopup", "Allows setting ranges like -1 to 5 or -2 to 10 for more flexibility.");
                rangeDropdown.value = "";
                this.currentRange = this.rangeOptions[0]; // Revert to 0-2
            } else if (selectedLabel === "0-2") {
                this.currentRange = this.rangeOptions.find(option => option.label === selectedLabel);
            }
            this.updateRange();
        };

        const modeDropdown = document.createElement("select");
        modeDropdown.className = "leq--dropdown";
        modeDropdown.title = "Standard mode only in Light version";
        modeDropdown.innerHTML = `<option value="" selected>Mode</option>` +
            this.modeOptions.map(option => `<option value="${option.value}"> ${option.label}</option>`).join('');
        modeDropdown.value = ""; // Default to "Mode"
        modeDropdown.onchange = () => {
            const selectedMode = modeDropdown.value;
            if (selectedMode && selectedMode !== "standard") {
                this.showUpgradePopup(`${selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} Mode`, `${selectedMode}ModePopup`, {
                    "normalized": "Balances weights proportionally across tokens.",
                    "experimental": "Applies advanced experimental weighting techniques."
                }[selectedMode]);
                modeDropdown.value = "";
                this.currentMode = "standard"; // Revert to Standard
            } else if (selectedMode === "standard") {
                this.currentMode = selectedMode;
            }
            this.updateMode();
        };

        const ruleDropdown = document.createElement("select");
        ruleDropdown.className = "leq--dropdown";
        ruleDropdown.title = "None rule only in Light version";
        ruleDropdown.innerHTML = `<option value="" selected>Rule</option>` +
            this.ruleOptions.map(option => `<option value="${option.label}"> ${option.label}</option>`).join('');
        ruleDropdown.value = ""; // Default to "Rule"
        ruleDropdown.onchange = () => {
            const selectedLabel = ruleDropdown.value;
            if (selectedLabel && selectedLabel !== "None") {
                this.showUpgradePopup(`${selectedLabel} Rule`, `${selectedLabel}RulePopup`, {
                    "Equal": "Distributes weights evenly across tokens.",
                    "Exponential": "Applies an exponential weight distribution.",
                    "Buffer": "Distributes weights with a buffer effect."
                }[selectedLabel]);
                ruleDropdown.value = "";
                this.currentRule = this.ruleOptions[0]; // Revert to None
            } else if (selectedLabel === "None") {
                this.currentRule = this.ruleOptions.find(option => option.label === selectedLabel);
            }
            this.createSliders();
        };

        dropdownsContainer.append(rangeDropdown, modeDropdown, ruleDropdown);

        operationWindow.append(buttonsContainer, dropdownsContainer);
        settingsContent.append(operationWindow);
        settingsSection.append(settingsHeader, settingsContent);

        const slidersSection = document.createElement("div");
        slidersSection.className = "leq--collapsible-section";
        slidersSection.dataset.section = "sliders";
        const slidersHeader = document.createElement("div");
        slidersHeader.className = "leq--collapsible-header";
        slidersHeader.textContent = "🎚️ Sliders";
        slidersHeader.title = "Adjust weights for each token with sliders";
        const slidersContent = document.createElement("div");
        slidersContent.className = "leq--collapsible-content";
        slidersContent.style.display = "none";

        this.equalizerContainer = document.createElement("div");
        this.equalizerContainer.className = "leq--equalizer-container";
        this.equalizerContainer.style.display = "flex";
        this.equalizerContainer.style.flexDirection = "row";
        this.equalizerContainer.style.gap = "0";
        this.equalizerContainer.style.padding = "10px";
        this.equalizerContainer.style.backgroundColor = "#202020";
        this.equalizerContainer.style.borderRadius = "12px";
        this.equalizerContainer.style.border = "1px solid #777";
        this.equalizerContainer.style.flexWrap = "nowrap";
        this.equalizerContainer.style.overflowX = "auto";
        this.equalizerContainer.style.position = "relative";

        slidersContent.append(this.equalizerContainer);
        slidersSection.append(slidersHeader, slidersContent);

        const promptSection = document.createElement("div");
        promptSection.className = "leq--collapsible-section";
        promptSection.dataset.section = "promptAndTokens";
        const promptHeader = document.createElement("div");
        promptHeader.className = "leq--collapsible-header";
        promptHeader.textContent = "✍️ Prompt and Tokens";
        promptHeader.title = "Enter your prompt and view tokenized results";
        const promptContent = document.createElement("div");
        promptContent.className = "leq--collapsible-content";
        promptContent.style.display = "none";

        const promptLabel = document.createElement("label");
        promptLabel.className = "leq--label";
        promptLabel.textContent = "Enter Prompt:";
        promptLabel.title = "Input your prompt here (comma-separated tokens)";
        promptLabel.style.display = "block";
        promptLabel.style.marginBottom = "10px";

        this.promptInput = document.createElement("textarea");
        this.promptInput.className = "leq--prompt-input";
        this.promptInput.style.width = "100%";
        this.promptInput.style.height = "50px";
        this.promptInput.style.backgroundColor = "#555";
        this.promptInput.style.color = "#ccc";
        this.promptInput.style.border = "1px solid #777";
        this.promptInput.style.borderRadius = "4px";
        this.promptInput.style.padding = "5px";
        this.promptInput.style.fontSize = "0.8em";
        this.promptInput.placeholder = "Enter your prompt here...";
        this.promptInput.value = this.prompt;
        this.promptInput.title = "Enter a comma-separated list of tokens (e.g., cat, dog, bird)";
        this.promptInput.oninput = () => this.updateTokensAndSliders(this.promptInput.value);
        this.promptInput.style.marginBottom = "15px";

        const tokenLabel = document.createElement("label");
        tokenLabel.className = "leq--label";
        tokenLabel.textContent = "Tokens:";
        tokenLabel.title = "List of tokens extracted from your prompt";
        tokenLabel.style.display = "block";
        tokenLabel.style.marginBottom = "10px";

        this.tokenContainer = document.createElement("div");
        this.tokenContainer.className = "leq--token-container";
        this.tokenContainer.style.display = "flex";
        this.tokenContainer.style.flexWrap = "wrap";
        this.tokenContainer.style.gap = "5px";
        this.tokenContainer.style.padding = "10px";
        this.tokenContainer.style.backgroundColor = "#202020";
        this.tokenContainer.style.borderRadius = "12px";
        this.tokenContainer.style.border = "1px solid #777";
        this.tokenContainer.style.marginBottom = "15px";

        const remainingTokensLabel = document.createElement("label");
        remainingTokensLabel.className = "leq--label";
        remainingTokensLabel.textContent = "Remaining Tokens (for copy/paste):";
        remainingTokensLabel.title = "Excess tokens beyond the limit are shown here (Standard/Pro feature)";
        remainingTokensLabel.style.display = "block";
        remainingTokensLabel.style.marginBottom = "10px";

        this.remainingTokensArea = document.createElement("textarea");
        this.remainingTokensArea.className = "leq--remaining-tokens";
        this.remainingTokensArea.style.width = "100%";
        this.remainingTokensArea.style.height = "50px";
        this.remainingTokensArea.style.backgroundColor = "#555";
        this.remainingTokensArea.style.color = "#ccc";
        this.remainingTokensArea.style.border = "1px solid #777";
        this.remainingTokensArea.style.borderRadius = "4px";
        this.remainingTokensArea.style.padding = "5px";
        this.remainingTokensArea.style.fontSize = "0.8em";
        this.remainingTokensArea.placeholder = "Upgrade to Standard/Pro to manage more tokens!";
        this.remainingTokensArea.disabled = true;
        this.remainingTokensArea.title = "Remaining Tokens feature available in Standard/Pro";
        this.remainingTokensArea.onclick = () => this.showUpgradePopup("Remaining Tokens Feature", "RemainingTokensPopup", "Manages excess tokens automatically.");

        promptContent.append(promptLabel, this.promptInput, tokenLabel, this.tokenContainer, remainingTokensLabel, this.remainingTokensArea);
        promptSection.append(promptHeader, promptContent);

        mainContent.append(settingsSection, slidersSection, promptSection);
        contentWrapper.append(mainContent);
        this.modal.append(titlebar, contentWrapper);

        const resizeHandle = document.createElement("div");
        resizeHandle.className = "leq--modal-resize-handle";
        resizeHandle.title = "Drag to resize the modal";
        this.modal.appendChild(resizeHandle);

        this.modal.style.width = `${this.currentWidth}px`;
        this.modal.style.height = `${this.currentHeight}px`;
        if (this.isCollapsed) {
            contentWrapper.style.display = "none";
            resizeHandle.style.display = "none";
            this.modal.classList.add("leq--modal-collapsed");
            collapseBtn.textContent = "+";
            this.contactLink.style.display = "none";
        } else {
            contentWrapper.style.display = "flex";
            resizeHandle.style.display = "block";
            this.modal.classList.remove("leq--modal-collapsed");
            collapseBtn.textContent = "-";
            this.contactLink.style.display = "inline";
        }

        document.body.appendChild(this.modal);

        this.setupDragHandlers(this.modal, titlebar);
        this.setupResizeHandle(resizeHandle);
        this.loadModalState(this.node);

        const collapsibleSections = this.modal.querySelectorAll(".leq--collapsible-section");
        collapsibleSections.forEach(section => {
            const header = section.querySelector(".leq--collapsible-header");
            const content = section.querySelector(".leq--collapsible-content");
            const sectionId = section.dataset.section;
            header.addEventListener("click", () => {
                this.sectionStates[sectionId] = !this.sectionStates[sectionId];
                content.style.display = this.sectionStates[sectionId] ? "block" : "none";
                this.saveModalState(this.node);
                this.adjustModalHeight();
            });
        });

        this.adjustModalHeight();
    }

    showUpgradePopup(featureName, popupKey, featureDescription = "") {
        const nodeData = this.getNodeData(this.node);
        const suppressKey = `suppress${popupKey || featureName.replace(/\s+/g, '')}Popup`;
        const isSuppressed = nodeData[suppressKey] || false;
        const descriptionPart = featureDescription ? ` ${featureDescription}` : "";

        if (!isSuppressed) {
            this.showPopup({
                message: `
                    <h3 style="color:rgb(173, 12, 0);">Unlock More Power! 🚀</h3>
                    <p>The full "${featureName}" feature is available in the Standard or Pro version.${descriptionPart}</p>
                    Consider upgrading for an even better Experience 😁!<br>
                    <a href="https://www.twitch.tv/SirWillance" target="_blank" class="leq--contact-link">twitch.tv/SirWillance</a>
                `,
                buttons: [{ text: "OK", onClick: () => {} }],
                showToggle: true,
                toggleText: "Don’t show this message again",
                toggleState: isSuppressed,
                onToggleChange: (checked) => {
                    const updatedNodeData = { ...nodeData, [suppressKey]: checked };
                    this.setNodeData(this.node, updatedNodeData);
                    this.saveModalState(this.node);
                }
            });
        }
    }

    updateRange() {
        const rangeDropdown = this.modal.querySelector(".leq--dropdown");
        if (rangeDropdown.value === "") {
            this.currentRange = this.rangeOptions[0]; // Default to 0-2 if no selection
        }
        this.sliders.forEach((slider, i) => {
            slider.min = this.currentRange.min;
            slider.max = this.currentRange.max;
            this.weights[i] = Math.max(this.currentRange.min, Math.min(this.currentRange.max, this.weights[i]));
            slider.value = this.weights[i];
            const valueInput = slider.parentElement.querySelector(".leq--value-input");
            if (valueInput) {
                valueInput.value = this.weights[i].toFixed(2);
            }
            this.updateSliderColor(slider, this.weights[i]);
        });
    }

    updateMode() {
        const modeDropdown = this.modal.querySelector(".leq--dropdown:nth-child(2)");
        if (modeDropdown.value === "") {
            this.currentMode = "standard"; // Default to Standard if no selection
        }
        this.updateSliderStates();
    }

    updateTokensAndSliders(prompt) {
        this.tokenize(prompt);
        this.updateTokenDisplay();
        this.createSliders();
    }

    tokenize(prompt) {
        let tokens = prompt.split(/,(?![^(]*\))/g)
            .map(token => token.trim())
            .filter(token => token !== "");

        this.tokens = [];
        this.weights = [];
        this.anchoredStates = [];

        tokens.forEach(token => {
            let cleanedToken = token.replace(/[()]/g, '').trim();
            const match = cleanedToken.match(/(.+):([\d\.]+)/);
            if (match) {
                this.tokens.push(match[1].trim());
                this.weights.push(parseFloat(match[2]));
            } else {
                this.tokens.push(cleanedToken);
                this.weights.push(1.0);
            }
            this.anchoredStates.push(false);
        });

        this.tokens = this.tokens.slice(0, this.maxTokens);
        this.weights = this.weights.slice(0, this.maxTokens);
        this.anchoredStates = this.anchoredStates.slice(0, this.maxTokens);
        this.remainingTokens = tokens.slice(this.maxTokens);
    }

    updateTokenDisplay() {
        this.tokenContainer.innerHTML = "";
        this.tokens.forEach((token, index) => {
            const tokenElement = document.createElement("span");
            tokenElement.className = "leq--token";
            tokenElement.textContent = `${index + 1}: ${token}`;
            tokenElement.style.backgroundColor = "#444444";
            tokenElement.style.color = "#fff";
            tokenElement.style.padding = "5px";
            tokenElement.style.borderRadius = "4px";
            tokenElement.title = `Token ${index + 1}: ${token}`;
            this.tokenContainer.appendChild(tokenElement);
        });

        this.remainingTokensArea.value = ""; // Light version: No remaining tokens display
        if (this.tokens.length >= this.maxTokens && !this.hasShownTokenWarning) {
            this.hasShownTokenWarning = true;
            this.showPopup({
                message: `Warning: Too many tokens. Only the first ${this.maxTokens} tokens will be used. Upgrade to Standard/Pro to manage more tokens!`,
                buttons: [{ text: "OK", onClick: () => {} }]
            });
        }
    }

    createSliders() {
        this.equalizerContainer.innerHTML = "";
        this.sliders = [];

        for (let i = 0; i < this.tokens.length; i++) {
            const equalizerItem = document.createElement("div");
            equalizerItem.className = "leq--equalizer-item";
            equalizerItem.style.position = "absolute";
            equalizerItem.style.left = `${i * this.itemSpacing}px`;

            const anchorCheckbox = document.createElement("input");
            anchorCheckbox.type = "checkbox";
            anchorCheckbox.className = "leq--anchor-checkbox";
            anchorCheckbox.checked = this.anchoredStates[i];
            anchorCheckbox.title = "Anchor this slider to prevent changes";
            anchorCheckbox.onclick = () => this.toggleAnchorCheckbox(i);

            const numberLabel = document.createElement("span");
            numberLabel.className = "leq--number-label";
            numberLabel.textContent = `${i + 1}`;
            numberLabel.title = `Token ${i + 1}: ${this.tokens[i]}`;

            const slider = document.createElement("input");
            slider.type = "range";
            slider.className = "leq--vertical-slider";
            slider.min = this.currentRange.min.toString();
            slider.max = this.currentRange.max.toString();
            slider.step = "0.01";
            slider.value = (this.weights[i] || 1.0).toString();
            slider.setAttribute("orient", "vertical");
            slider.title = `Adjust weight for "${this.tokens[i]}" (Range: 0 to 2 in Light version)`;
            slider.oninput = (e) => this.handleSliderChange(i, parseFloat(e.target.value));
            this.sliders.push(slider);

            const valueInput = document.createElement("input");
            valueInput.type = "text";
            valueInput.className = "leq--value-input";
            valueInput.value = (this.weights[i] || 1.0).toFixed(2);
            valueInput.style.width = "40px";
            valueInput.style.padding = "2px";
            valueInput.style.border = "1px solid #777";
            valueInput.style.borderRadius = "4px";
            valueInput.style.backgroundColor = "#555";
            valueInput.style.color = "#ccc";
            valueInput.style.fontSize = "0.8em";
            valueInput.style.textAlign = "center";
            valueInput.title = `Enter weight for "${this.tokens[i]}" (Range: 0 to 2 in Light version)`;
            valueInput.oninput = (e) => {
                const newValue = parseFloat(e.target.value);
                if (!isNaN(newValue)) {
                    this.handleInputChange(i, newValue);
                }
            };

            equalizerItem.append(anchorCheckbox, numberLabel, slider, valueInput);
            this.equalizerContainer.appendChild(equalizerItem);
            this.updateSliderColor(slider, parseFloat(slider.value));
        }

        this.updateSliderStates();
    }

    updateSliderStates() {
        this.sliders.forEach((slider, i) => {
            const valueInput = slider.parentElement.querySelector(".leq--value-input");
            const anchorCheckbox = slider.parentElement.querySelector(".leq--anchor-checkbox");

            if (!valueInput || !anchorCheckbox) {
                console.warn(`Missing UI elements for slider ${i}, recreating sliders`);
                this.createSliders();
                return;
            }

            slider.value = this.weights[i].toString();
            valueInput.value = this.weights[i].toFixed(2);
            this.updateSliderColor(slider, this.weights[i]);

            anchorCheckbox.checked = this.anchoredStates[i];
            if (this.anchoredStates[i]) {
                slider.disabled = true;
                valueInput.disabled = true;
                anchorCheckbox.style.opacity = "0.5";
                slider.style.cursor = "not-allowed";
                valueInput.style.cursor = "not-allowed";
            } else {
                slider.disabled = false;
                valueInput.disabled = false;
                anchorCheckbox.style.opacity = "1";
                slider.style.cursor = "pointer";
                valueInput.style.cursor = "auto";
            }
        });
    }

    handleSliderChange(index, newValue) {
        if (this.anchoredStates[index]) {
            console.log(`Cannot adjust slider: Token ${index + 1} is anchored`);
            return;
        }

        const oldValue = this.weights[index];
        this.weights[index] = newValue;

        if ((newValue < 0 || newValue > 2) && !this.hasShownWeightWarning) {
            this.hasShownWeightWarning = true;
            this.showPopup({
                message: `Warning: Weight (${newValue.toFixed(2)}) for token "${this.tokens[index]}" is outside the comfort zone (0-2).`,
                buttons: [{ text: "OK", onClick: () => {} }]
            });
        }

        this.updateSliderStates();
    }

    handleInputChange(index, newValue) {
        if (this.anchoredStates[index]) {
            console.log(`Cannot adjust value: Token ${index + 1} is anchored`);
            return;
        }
        if (isNaN(newValue)) newValue = this.currentRange.min;
        newValue = Math.max(this.currentRange.min, Math.min(this.currentRange.max, newValue));
        this.weights[index] = newValue;

        if ((newValue < 0 || newValue > 2) && !this.hasShownWeightWarning) {
            this.hasShownWeightWarning = true;
            this.showPopup({
                message: `Warning: Weight (${newValue.toFixed(2)}) for token "${this.tokens[index]}" is outside the comfort zone (0-2).`,
                buttons: [{ text: "OK", onClick: () => {} }]
            });
        }

        this.updateSliderStates();
    }

    updateSliderColor(slider, value) {
        slider.classList.remove("safe-range", "high-range", "negative-range");
        const rangeSpan = this.currentRange.max - this.currentRange.min;
        const midPoint = (this.currentRange.max + this.currentRange.min) / 2;
        const highThreshold = midPoint + (rangeSpan * 0.25);
        const lowThreshold = midPoint - (rangeSpan * 0.25);

        if (value < lowThreshold) {
            slider.classList.add("negative-range");
        } else if (value > highThreshold) {
            slider.classList.add("high-range");
        } else {
            slider.classList.add("safe-range");
        }
    }

    toggleAnchorCheckbox(index) {
        this.anchoredStates[index] = !this.anchoredStates[index];
        this.updateSliderStates();
    }

    confirmChanges() {
        const sliderValues = this.weights.map(weight => parseFloat(weight) || 1.0);
        let weightedPromptParts = [];
        for (let i = 0; i < this.tokens.length; i++) {
            const token = this.tokens[i];
            const weight = sliderValues[i];
            if (weight === 1.0) {
                weightedPromptParts.push(token);
            } else {
                weightedPromptParts.push(`(${token}:${weight.toFixed(2)})`);
            }
        }

        const weightedPrompt = weightedPromptParts.join(", ");
        const userInputWidget = this.node.widgets.find(w => w.name === "user_input");
        if (userInputWidget) {
            userInputWidget.value = weightedPrompt;
            if (userInputWidget.callback) {
                userInputWidget.callback(userInputWidget.value);
            }
        }

        this.promptInput.value = weightedPrompt;
        const suppressConfirm = this.getNodeData(this.node).suppressConfirm || false;
        if (!suppressConfirm) {
            const message = this.showPromptInPopup ? `Changes confirmed.\nUpdated Prompt: ${weightedPrompt}` : "Changes confirmed.";
            this.showPopup({
                message: message,
                buttons: [{ text: "OK", onClick: () => {} }],
                showToggle: true,
                toggleText: "Don’t show again",
                toggleState: suppressConfirm,
                onToggleChange: (checked) => {
                    const nodeData = this.getNodeData(this.node);
                    this.setNodeData(this.node, { ...nodeData, suppressConfirm: checked });
                    this.saveModalState(this.node);
                }
            });
        }
    }

    resetWeights() {
        this.weights = this.tokens.map(() => 1.0);
        this.createSliders();

        const suppressReset = this.getNodeData(this.node).suppressReset || false;
        if (!suppressReset) {
            this.showPopup({
                message: "Weights reset to default (1.0) for all tokens.",
                buttons: [{ text: "OK", onClick: () => {} }],
                showToggle: true,
                toggleText: "Don’t show again",
                toggleState: suppressReset,
                onToggleChange: (checked) => {
                    const nodeData = this.getNodeData(this.node);
                    this.setNodeData(this.node, { ...nodeData, suppressReset: checked });
                    this.saveModalState(this.node);
                }
            });
        }
    }

    close() {
        this.saveModalState(this.node);
        this.hasShownWeightWarning = false;
        this.hasShownTokenWarning = false;
        this.modal.remove();
    }

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        const contentWrapper = this.modal.querySelector(".leq--modal-content-wrapper");
        const resizeHandle = this.modal.querySelector(".leq--modal-resize-handle");
        const collapseBtn = this.modal.querySelector(".leq--modal__collapse");

        if (this.isCollapsed) {
            this.originalWidth = this.modal.offsetWidth;
            this.originalHeight = this.modal.offsetHeight;
            this.modal.style.width = `${this.minWidth}px`;
            this.modal.style.height = `${this.minHeight}px`;
            contentWrapper.style.display = "none";
            resizeHandle.style.display = "none";
            this.modal.classList.add("leq--modal-collapsed");
            collapseBtn.textContent = "+";
            collapseBtn.title = "Expand the modal";
            this.contactLink.style.display = "none";
        } else {
            this.modal.style.width = `${this.originalWidth || this.defaultWidth}px`;
            this.modal.style.height = `${this.originalHeight || this.defaultHeight}px`;
            contentWrapper.style.display = "flex";
            resizeHandle.style.display = "block";
            this.modal.classList.remove("leq--modal-collapsed");
            collapseBtn.textContent = "-";
            collapseBtn.title = "Collapse the modal";
            this.contactLink.style.display = "inline";
        }
        this.saveModalState(this.node);
        this.adjustModalHeight();
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

        resizeHandle.addEventListener("mousedown", (e) => {
            if (this.isCollapsed) return;
            e.preventDefault();
            isResizing = true;
            this.isResizing = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.startWidth = this.modal.offsetWidth;
            this.startHeight = this.modal.offsetHeight;
            document.addEventListener("mousemove", this.resizeHandler.bind(this));
            document.addEventListener("mouseup", () => {
                isResizing = false;
                this.isResizing = false;
                this.currentWidth = this.modal.offsetWidth; // Persist new width
                this.currentHeight = this.modal.offsetHeight; // Persist new height
                document.removeEventListener("mousemove", this.resizeHandler);
                this.saveModalState(this.node);
                this.adjustModalHeight();
            });
        });
    }

    resizeHandler(e) {
        if (!this.isResizing) return;
        const newWidth = Math.max(this.minWidth, Math.min(this.maxWidth, this.startWidth + (e.clientX - this.startX)));
        const newHeight = Math.max(this.minHeight, Math.min(this.maxHeight, this.startHeight + (e.clientY - this.startY)));
        this.modal.style.width = `${newWidth}px`;
        this.modal.style.height = `${newHeight}px`;
    }

    saveModalState(node) {
        const nodeData = node.widgets_values || {};
        const userInputWidget = this.node.widgets.find(w => w.name === "user_input");
        nodeData.currentWidth = this.currentWidth;
        nodeData.currentHeight = this.currentHeight;
        nodeData.isCollapsed = this.isCollapsed;
        nodeData.weights = this.weights;
        nodeData.anchoredStates = this.anchoredStates;
        nodeData.currentRangeLabel = this.currentRange.label;
        nodeData.currentMode = this.currentMode;
        nodeData.currentRuleLabel = this.currentRule.label;
        nodeData.sectionStates = this.sectionStates;
        nodeData.suppressClearWarning = this.suppressClearWarning;
        nodeData.suppressClearSuccess = this.suppressClearSuccess;
        nodeData.showPromptInPopup = this.showPromptInPopup;
        nodeData.suppressConfirm = this.getNodeData(this.node).suppressConfirm || false;
        nodeData.suppressReset = this.getNodeData(this.node).suppressReset || false;
        if (userInputWidget) {
            nodeData.promptInputValue = userInputWidget.value || this.promptInput.value;
        } else {
            nodeData.promptInputValue = this.promptInput.value;
        }
        node.widgets_values = nodeData;
    }

    loadModalState(node) {
        const nodeData = node.widgets_values || {};
        this.currentWidth = Math.min(this.maxWidth, Math.max(this.minWidth, nodeData.currentWidth || this.defaultWidth));
        this.currentHeight = Math.min(this.maxHeight, Math.max(this.minHeight, nodeData.currentHeight || this.defaultHeight));
        this.isCollapsed = nodeData.isCollapsed || false;
        this.weights = nodeData.weights || this.weights.map(() => 1.0);
        this.anchoredStates = nodeData.anchoredStates || this.anchoredStates.map(() => false);
        this.currentRange = this.rangeOptions[0]; // Hardcode to 0-2
        this.currentMode = "standard"; // Hardcode to Standard
        this.currentRule = this.ruleOptions[0]; // Hardcode to None
        this.sectionStates = nodeData.sectionStates || {
            settings: false,
            sliders: false,
            promptAndTokens: false
        };
        this.suppressClearWarning = nodeData.suppressClearWarning || false;
        this.suppressClearSuccess = nodeData.suppressClearSuccess || false;
        this.showPromptInPopup = nodeData.showPromptInPopup || false;
        const userInputWidget = this.node.widgets.find(w => w.name === "user_input");
        this.promptInput.value = userInputWidget ? userInputWidget.value || nodeData.promptInputValue || this.prompt : nodeData.promptInputValue || this.prompt;

        this.modal.style.width = `${this.currentWidth}px`;
        this.modal.style.height = `${this.currentHeight}px`;

        const contentWrapper = this.modal.querySelector(".leq--modal-content-wrapper");
        const resizeHandle = this.modal.querySelector(".leq--modal-resize-handle");
        const collapseBtn = this.modal.querySelector(".leq--modal__collapse");

        if (this.isCollapsed) {
            contentWrapper.style.display = "none";
            resizeHandle.style.display = "none";
            this.modal.classList.add("leq--modal-collapsed");
            collapseBtn.textContent = "+";
            collapseBtn.title = "Expand the modal";
            this.contactLink.style.display = "none";
        } else {
            contentWrapper.style.display = "flex";
            resizeHandle.style.display = "block";
            this.modal.classList.remove("leq--modal-collapsed");
            collapseBtn.textContent = "-";
            collapseBtn.title = "Collapse the modal";
            this.contactLink.style.display = "inline";
        }

        const rangeDropdown = this.modal.querySelector(".leq--dropdown");
        const modeDropdown = this.modal.querySelector(".leq--dropdown:nth-child(2)");
        const ruleDropdown = this.modal.querySelector(".leq--dropdown:nth-child(3)");

        if (rangeDropdown) rangeDropdown.value = "";
        if (modeDropdown) modeDropdown.value = "";
        if (ruleDropdown) ruleDropdown.value = "";

        Object.keys(this.sectionStates).forEach(sectionId => {
            const section = this.modal.querySelector(`.leq--collapsible-section[data-section="${sectionId}"]`);
            if (section) {
                const content = section.querySelector(".leq--collapsible-content");
                if (content) {
                    content.style.display = this.sectionStates[sectionId] ? "block" : "none";
                }
            }
        });

        this.createSliders();
        this.adjustModalHeight();
    }

    showPopup({ message, buttons = [], showToggle = false, toggleText = "", toggleState = false, onToggleChange = () => {} }) {
        const popup = document.createElement("div");
        popup.className = "leq--alert leq--alert-warning";
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
        popup.style.zIndex = "1003";
        popup.style.color = "#fff";
        popup.style.textAlign = "center";
        popup.style.opacity = "0";
        popup.style.transition = "opacity 0.3s ease";
    
        const messageEl = document.createElement("div");
        messageEl.className = "leq--popup-message";
        messageEl.innerHTML = message;
        messageEl.style.marginBottom = "20px";
        messageEl.style.padding = "0 20px";
        popup.appendChild(messageEl);
    
        if (showToggle) {
            const toggleContainer = document.createElement("div");
            toggleContainer.className = "leq--popup-toggle";
            toggleContainer.style.marginBottom = "20px";
            const toggleInput = document.createElement("input");
            toggleInput.type = "checkbox";
            toggleInput.id = `leq-toggle-${Date.now()}`;
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
        buttonContainer.className = "leq--popup-buttons";
        buttonContainer.style.display = "flex";
        buttonContainer.style.gap = "15px";
        buttonContainer.style.justifyContent = "center";
        buttons.forEach(btn => {
            const button = document.createElement("button");
            // Apply different classes based on text
            button.className = btn.text === "No" ? "leq--cancel-button" : "leq--understood-button";
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
        });
    }

    clearAllHandler() {
        const nodeData = this.getNodeData(this.node);
        this.suppressClearWarning = nodeData.suppressClearWarning || false;
        this.suppressClearSuccess = nodeData.suppressClearSuccess || false;

        const clearPrompts = () => {
            this.promptInput.value = "";
            this.updateTokensAndSliders("");
            this.saveModalState(this.node);
            this.adjustModalHeight();
            if (!this.suppressClearSuccess) {
                this.showPopup({
                    message: "All prompts and tokens cleared! Enter new prompts or adjust weights.",
                    buttons: [{ text: "OK", onClick: () => {} }],
                    showToggle: true,
                    toggleText: "Don’t show this message again",
                    toggleState: this.suppressClearSuccess,
                    onToggleChange: (checked) => {
                        this.suppressClearSuccess = checked;
                        const updatedNodeData = {
                            ...this.getNodeData(this.node),
                            suppressClearSuccess: checked
                        };
                        this.setNodeData(this.node, updatedNodeData);
                        this.saveModalState(this.node);
                    }
                });
            }
        };

        if (this.suppressClearWarning) {
            clearPrompts();
        } else {
            this.showPopup({
                message: "Are you sure you want to clear all prompts and tokens?",
                buttons: [
                    {
                        text: "Yes",
                        onClick: () => clearPrompts()
                    },
                    { text: "No", onClick: () => {} }
                ],
                showToggle: true,
                toggleText: "Don’t show this message again",
                toggleState: this.suppressClearWarning,
                onToggleChange: (checked) => {
                    this.suppressClearWarning = checked;
                    const updatedNodeData = {
                        ...this.getNodeData(this.node),
                        suppressClearWarning: checked
                    };
                    this.setNodeData(this.node, updatedNodeData);
                    this.saveModalState(this.node);
                }
            });
        }
    }

    getNodeData(node) {
        return node.widgets_values || {};
    }

    setNodeData(node, data) {
        node.widgets_values = data;
    }

    adjustModalHeight() {
        if (this.isCollapsed) {
            this.modal.style.height = `${this.minHeight}px`;
            return;
        }

        const titlebarHeight = this.modal.querySelector(".leq--modal__titlebar").offsetHeight;
        const collapsibleSections = this.modal.querySelectorAll(".leq--collapsible-section");
        let contentHeight = 0;

        collapsibleSections.forEach(section => {
            const content = section.querySelector(".leq--collapsible-content");
            if (content && content.style.display !== "none") {
                contentHeight += content.offsetHeight + 20;
            }
            contentHeight += section.querySelector(".leq--collapsible-header").offsetHeight;
        });

        const padding = 30;
        const calculatedHeight = titlebarHeight + contentHeight + padding;
        const currentHeight = this.modal.offsetHeight;

        // Only adjust height if it’s less than the minimum or greater than the maximum, respecting user resize
        if (currentHeight < this.minHeight || currentHeight > this.maxHeight) {
            this.modal.style.height = `${Math.max(this.minHeight, Math.min(this.maxHeight, calculatedHeight))}px`;
        } else if (!this.isResizing) {
            this.modal.style.height = `${Math.max(this.minHeight, Math.min(this.maxHeight, Math.max(currentHeight, calculatedHeight)))}px`;
        }
    }
}