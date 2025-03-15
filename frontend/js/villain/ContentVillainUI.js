import { app } from "../../../../../scripts/app.js";
import { BaseModal } from "../shared/BaseModal.js";

export const VERSION = "Light";

app.registerExtension({
    name: "FoW_Suite_LIGHT.ContentVillainUI",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLContentVillain") {
            nodeType.prototype.onNodeCreated = function() {
                console.log(`ContentVillainUI v${VERSION}: Node created.`);
                this.selectedTokens = new Set();
                this.modal = new BaseModal({
                    type: "Content",
                    rootKey: "FoW - Content", // Adjust if JSON root differs
                    version: VERSION
                });
                this.addWidget("button", "Open Content Catalogue", "Load Catalogue", () => this.modal.create(this));
                this.onRemoved = () => {
                    console.log(`ContentVillainUI v${VERSION}: Node removed.`);
                    if (this.modal) this.modal.cleanup(this);
                };
            };
        }
    }
});