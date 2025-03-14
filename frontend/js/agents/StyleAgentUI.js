// FoW_Suite_LIGHT/StyleAgentUI.js
import { app } from "../../../../../scripts/app.js";
import { BaseModal } from "../shared/BaseModal.js";

export const VERSION = "Light";

// Static cache for preview images
const previewCache = {};

app.registerExtension({
    name: "FoW_Suite_LIGHT.StyleAgentUI",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLStyleAgent") {
            // Initialize previewCache from the first node with base64 data
            if (Object.keys(previewCache).length === 0) {
                const firstNode = app.graph._nodes.find(n => n.type === "FoWLStyleAgentLight");
                if (firstNode) {
                    const previewWidget = firstNode.widgets.find(w => w.name === "preview_images");
                    if (previewWidget) {
                        const previewData = JSON.parse(previewWidget.value || '{}');
                        if (!Array.isArray(previewData) && typeof previewData === 'object') {
                            // First node should have base64 data
                            Object.assign(previewCache, previewData);
                            console.log("Initialized previewCache with base64 data:", Object.keys(previewCache));
                        } else {
                            console.warn("First node does not contain base64 data; expected an object.");
                        }
                    }
                }
            }

            const modal = new BaseModal({
                type: "Style",
                rootKey: "FoW - Styles",
                version: VERSION
            });

            nodeType.prototype.onNodeCreated = function() {
                console.log(`StyleAgentUI v${VERSION}: Node created.`);
                this.selectedTokens = new Set();

                const openModalButton = this.addWidget(
                    "button",
                    "Open Style Catalogue",
                    "Load Style Catalogue",
                    () => {
                        const previewWidget = this.widgets.find(w => w.name === "preview_images");
                        const previewData = previewWidget ? JSON.parse(previewWidget.value || '[]') : [];
                        // Ensure modal.previewImages is an object mapping filenames to base64
                        modal.previewImages = {};
                        if (Array.isArray(previewData)) {
                            // Subsequent nodes: Map filenames to base64 from previewCache
                            previewData.forEach(filename => {
                                modal.previewImages[filename] = previewCache[filename] || null;
                            });
                        } else {
                            // First node: Use the base64 data directly
                            Object.assign(modal.previewImages, previewData);
                            // Update previewCache if needed
                            Object.assign(previewCache, previewData);
                        }
                        console.log("Passing preview data to modal:", Object.keys(modal.previewImages));
                        modal.create(this);
                    }
                );

                this.openModalButton = openModalButton;

                const userInputWidget = this.widgets.find(w => w.name === "user_input");
                if (userInputWidget) {
                    userInputWidget.callback = (value) => {
                        console.log("User input updated:", value);
                        if (this.onUpdate) this.onUpdate();
                    };
                }

                this.onRemoved = () => {
                    console.log(`StyleAgentUI v${VERSION}: Node removed.`);
                    modal.cleanup(this);
                };
            };
        }
    }
});

window.previewCache = previewCache;