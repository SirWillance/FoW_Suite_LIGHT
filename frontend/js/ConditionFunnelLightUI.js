// frontend/js/ConditionFunnelUI.js
import { app } from "../../../../scripts/app.js";

app.registerExtension({
    name: "FoW_Suite_LIGHT.ConditionFunnelLight",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLConditionFunnelLight") {
            const MAX_INPUT_COUNT = 7;

            nodeType.prototype.onNodeCreated = function() {
                console.log("ConditionFunnelLight created");

                // Inputcount widget
                const inputCountOptions = Array.from({ length: MAX_INPUT_COUNT }, (_, i) => (i + 1).toString());
                this.addWidget("combo", "inputcount", "1", (value) => {
                    const inputcount = parseInt(value, 10);
                    if (inputcount < 1 || inputcount > MAX_INPUT_COUNT) return;
                    this.updateInputs(inputcount);
                }, { values: inputCountOptions });

                // Initial inputs
                this.updateInputs(1);

            };

            nodeType.prototype.updateInputs = function(inputcount) {
                const currentInputs = this.inputs.filter(i => i.name.startsWith("Text "));
                const currentInputCount = currentInputs.length;

                if (inputcount > currentInputCount) {
                    for (let i = currentInputCount + 1; i <= inputcount; i++) {
                        this.addInput(`Text ${i}`, "STRING", { multiline: true });
                    }
                } else if (inputcount < currentInputCount) {
                    for (let i = currentInputCount; i > inputcount; i--) {
                        const index = this.inputs.findIndex(input => input.name === `Text ${i}`);
                        if (index !== -1) this.removeInput(index);
                    }
                }
                if (app.graph) app.graph.change();
            };
        }
    },
    VERSION: "Light"
});
