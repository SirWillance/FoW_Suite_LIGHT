import { app } from "../../../../../scripts/app.js";
import { BaseModal } from "../shared/BaseModal.js";

export const VERSION = "Light";

app.registerExtension({
    name: "FoW_Suite_LIGHT.StyleVillainUI",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLStyleVillain") {
            nodeType.prototype.onNodeCreated = function() {
                console.log(`StyleVillainUI v${VERSION}: Node created.`);
                this.selectedTokens = new Set();
                this.modal = new BaseModal({
                    type: "StyleVillain",
                    rootKey: "FoW - Dynamic", // Adjust if JSON root differs
                    version: VERSION
                });
                this.addWidget("button", "Open Dynamic Catalogue", "Load Catalogue", () => this.modal.create(this));
                this.onRemoved = () => {
                    console.log(`StyleVillainUI v${VERSION}: Node removed.`);
                    if (this.modal) this.modal.cleanup(this);
                };
            };
        }
    }
});