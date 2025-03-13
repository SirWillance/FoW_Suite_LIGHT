// FoW-Suite-Pro/frontend/js/PromptEqualizer.js
import { app } from "../../../../scripts/app.js";
import { LightEqualizerModal } from "./shared/LightEqualizerModal.js";

app.registerExtension({
    name: "FoW_Suite_LIGHT.PromptEqualizer",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLPromptEqualizerLight") {
            nodeType.prototype.onNodeCreated = function() {
                console.log("PromptEqualizer created for node", this.id);

                let modalInstance = null; // To hold the modal instance

                // Modal button
                this.addWidget("button", "Open Equalizer", "Open Equalizer", () => {
                    console.log("Checking modal for PromptEqualizer node", this.id);
                    const existingModal = document.getElementById(`bem-modal-${this.id}`);
                    if (existingModal) {
                        console.log("Modal already open for node", this.id, "—doing nothing");
                        return; // Do nothing if modal is already open
                    }

                    console.log("Opening modal for PromptEqualizer node", this.id);
                    const userInput = this.widgets.find(w => w.name === "user_input")?.value || ""; // ADD

                    modalInstance = new LightEqualizerModal(this, userInput); // Store modal instance // MOD
                });


                this.onRemoved = () => {
                    console.log("Cleaning up PromptEqualizer node", this.id);
                    modalInstance = null;
                };
            };
        }
    },
    VERSION: "Light"
});