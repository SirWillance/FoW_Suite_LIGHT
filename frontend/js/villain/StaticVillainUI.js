import { app } from "../../../../../scripts/app.js";
import { BaseModal } from "../shared/BaseModal.js";

export const VERSION = "Light";

app.registerExtension({
    name: "FoW_Suite_LIGHT.StaticVillainUI",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLStaticVillain") {
            nodeType.prototype.onNodeCreated = function() {
                console.log(`StaticVillainUI v${VERSION}: Node created.`);
                this.selectedTokens = new Set();
                this.modal = new BaseModal({
                    type: "Static",
                    rootKey: "FoW - Static", // Adjust if JSON root differs
                    version: VERSION
                });
                this.addWidget("button", "Open Static Catalogue", "Load Catalogue", () => this.modal.create(this));
                this.onRemoved = () => {
                    console.log(`StaticVillainUI v${VERSION}: Node removed.`);
                    if (this.modal) this.modal.cleanup(this);
                };
            };
        }
    }
});