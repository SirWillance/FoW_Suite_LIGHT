// frontend/js/agents/StyleVillainUI.js
import { app } from "../../../../../scripts/app.js";
import { BaseModal } from "../shared/BaseModal.js";

export const VERSION = "Light";

app.registerExtension({
    name: "FoW_Suite_LIGHT.DefinitionVillainUI",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLDefinitionVillain") {
            const modal = new BaseModal({
                type: "Negatives",
                rootKey: "FoW - Definition",
                version: VERSION
            });

            nodeType.prototype.onNodeCreated = function() {
                console.log(`DefinitionVillainUI v${VERSION}: Node created.`);
                this.selectedTokens = new Set();
                
                const openModalButton = this.addWidget(
                    "button",
                    "Open Definition Catalogue",
                    "Load Definition Catalogue",
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
                    console.log(`DefinitionVillainUI v${VERSION}: Node removed.`);
                    modal.cleanup(this);
                };
            };
        }
    }
});