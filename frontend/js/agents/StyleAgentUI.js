
import { app } from "../../../../../scripts/app.js";
import { BaseModal } from "../shared/BaseModal.js";

export const VERSION = "Light";

	// Node Registration Part 

app.registerExtension({
    name: "FoW_Suite_LIGHT.StyleAgentUI",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLStyleAgent") {
            const modal = new BaseModal({
                type: "Style",
                rootKey: "FoW - Styles",
                version: VERSION
            });

	// Down to this Part


            nodeType.prototype.onNodeCreated = function() {
                console.log(`StyleAgentUI v${VERSION}: Node created.`);
                this.selectedTokens = new Set();
                
                const openModalButton = this.addWidget(
                    "button",
                    "Open Style Catalogue",
                    "Load Style Catalogue",
                    () => modal.create(this)
                );

                this.openModalButton = openModalButton;

                const userInputWidget = this.widgets.find(w => w.name === "user_input"); // <- invis input
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
