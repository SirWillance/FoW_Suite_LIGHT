import { app } from "../../../../../scripts/app.js";
import { BaseModal } from "../shared/BaseModal.js";
import { hideWidgets } from "../shared/WidgetHider.js";

export const VERSION = "Light";

app.registerExtension({
    name: "FoW_Suite_LIGHT.StyleAgentUI",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLStyleAgent") {
            nodeType.prototype.onNodeCreated = function() {
                console.log(`StyleAgentUI v${VERSION}: Node created.`);
                this.selectedTokens = new Set();
                this.modal = new BaseModal({
                    type: "Style",
                    rootKey: "FoW - Styles",
                    version: VERSION
                });
                this.addWidget("button", "Open Style Catalogue", "Load Catalogue", () => this.modal.create(this));
                
                const widgetNames = [
                    "user_input" // Replace with actual widget names from the backend
                ];
                hideWidgets(this, widgetNames);
                
                this.onRemoved = () => {
                    console.log(`StyleAgentUI v${VERSION}: Node removed.`);
                    if (this.modal) this.modal.cleanup(this);
                };
            };
        }
    }
});