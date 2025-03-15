import { app } from "../../../../../scripts/app.js";
import { BaseModal } from "../shared/BaseModal.js";

export const VERSION = "Light";

app.registerExtension({
    name: "FoW_Suite_LIGHT.ShotAgentUI",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLShotAgent") {
            nodeType.prototype.onNodeCreated = function() {
                console.log(`ShotAgentUI v${VERSION}: Node created.`);
                this.selectedTokens = new Set();
                this.modal = new BaseModal({
                    type: "Shot",
                    rootKey: "FoW - Shots", // Adjust if JSON root differs
                    version: VERSION
                });
                this.addWidget("button", "Open Shot Catalogue", "Load Catalogue", () => this.modal.create(this));
                this.onRemoved = () => {
                    console.log(`ShotAgentUI v${VERSION}: Node removed.`);
                    if (this.modal) this.modal.cleanup(this);
                };
            };
        }
    }
});