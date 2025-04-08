import { app } from "../../../../../scripts/app.js";
import { BaseModal } from "../shared/BaseModal.js";
import { hideWidgets } from "../shared/WidgetHider.js";

export const VERSION = "Light";

app.registerExtension({
    name: "FoW_Suite_LIGHT.DefinitionVillainUI",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLDefinitionVillain") {
            nodeType.prototype.onNodeCreated = function() {
                console.log(`DefinitionVillainUI v${VERSION}: Node created.`);
                this.selectedTokens = new Set();
                this.modal = new BaseModal({
                    type: "Definition",
                    rootKey: "FoW - Definition", // Adjust if JSON root differs
                    version: VERSION
                });
                this.addWidget("button", "Open Definitions Catalogue", "Load Catalogue", () => this.modal.create(this));
                
                const widgetNames = [
                    "user_input" // Replace with actual widget names from the backend
                ];
                hideWidgets(this, widgetNames);
                
                this.onRemoved = () => {
                    console.log(`DefinitionVillainUI v${VERSION}: Node removed.`);
                    if (this.modal) this.modal.cleanup(this);
                };
            };
        }
    }
});