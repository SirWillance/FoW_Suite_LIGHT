// frontend/js/agents/StyleVillainUI.js
import { app } from "../../../../../scripts/app.js";
import { BaseModal } from "../shared/BaseModal.js";

export const VERSION = "Light";

app.registerExtension({
    name: "FoW_Suite_LIGHT.StaticVillainUI",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLStaticVillain") {
            const modal = new BaseModal({
                type: "Negatives",
                rootKey: "FoW - Static",
                version: VERSION
            });

            nodeType.prototype.onNodeCreated = function() {
                console.log(`StyleVillainUI v${VERSION}: Node created.`);
                this.selectedTokens = new Set();
                
                const openModalButton = this.addWidget(
                    "button",
                    "Enter Static Bank",
                    "Load Static Bank",
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
                    console.log(`StaticVillainUI v${VERSION}: Node removed.`);
                    modal.cleanup(this);
                };
            };
        }
    }
});