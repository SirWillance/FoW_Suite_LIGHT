import { app } from "../../../../../scripts/app.js";
import { BaseModal } from "../shared/BaseModal.js";

export const VERSION = "Light";

	// Node Registration Part 

app.registerExtension({
    name: "FoW_Suite_LIGHT.DetailAgentUI",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLDetailAgent") {
            const modal = new BaseModal({
                type: "Detail",
                rootKey: "FoW - Details",
                version: VERSION
            });

	// Down to this Part


            nodeType.prototype.onNodeCreated = function() {
                console.log(`DetailAgentUI v${VERSION}: Node created.`);
                this.selectedTokens = new Set();
                
                const openModalButton = this.addWidget(
                    "button",
                    "Open Detail Catalogue",
                    "Load Detail Catalogue",
                    () => modal.create(this)
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
                    console.log(`DetailAgentUI v${VERSION}: Node removed.`);
                    modal.cleanup(this);
                };
            };
        }
    }
});