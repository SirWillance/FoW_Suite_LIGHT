import { app } from "../../../../../scripts/app.js";
import { BaseModal } from "../shared/BaseModal.js";

export const VERSION = "Light";

	// Node Registration Part 

app.registerExtension({
    name: "FoW_Suite_LIGHT.ShotAgentUI",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLShotAgent") {
            const modal = new BaseModal({
                type: "Shot",
                rootKey: "FoW - Shots",
                version: VERSION
            });

	// Down to this Part


            nodeType.prototype.onNodeCreated = function() {
                console.log(`ShotAgentUI v${VERSION}: Node created.`);
                this.selectedTokens = new Set();

                // Add a button to open the style catalogue modal                
                const openModalButton = this.addWidget(
                    "button",
                    "Open Shot Catalogue",
                    "Load Shot Catalogue",
                    () => modal.create(this)
                );

                this.openModalButton = openModalButton;

                // Add a text widget to display the selected tokens in the node
                const userInputWidget = this.widgets.find(w => w.name === "user_input");
                if (userInputWidget) {
                    userInputWidget.callback = (value) => {
                        console.log("User input updated:", value);
                        if (this.onUpdate) this.onUpdate();
                    };
                }

                this.onRemoved = () => {
                    console.log(`ShotAgentUI v${VERSION}: Node removed.`);
                    modal.cleanup(this);
                };
            };
        }
    }
});