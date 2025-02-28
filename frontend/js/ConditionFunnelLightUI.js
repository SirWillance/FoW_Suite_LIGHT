
// frontend/js/ConditionFunnelUI.js
import { app } from "../../../../scripts/app.js";

app.registerExtension({
    name: "FoW_Suite_LIGHT.ConditionFunnelLight",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLConditionFunnelLight") {

            // **Fetch MAX_INPUT_COUNT from the Python backend**
            let MAX_INPUT_COUNT = 8; // Default value, will be overwritten if fetch fails
            try {
                // Assuming the ConditionFunnel class has a MAX_INPUT_COUNT attribute
                MAX_INPUT_COUNT = nodeData.input_types.required.MAX_INPUT_COUNT[0];
                if (typeof MAX_INPUT_COUNT !== 'number' || MAX_INPUT_COUNT <= 0) {
                    console.warn("Invalid MAX_INPUT_COUNT from backend, using default: 11");
                    MAX_INPUT_COUNT = 8; // Revert to default
                }
            } catch (error) {
                console.warn("Failed to fetch MAX_INPUT_COUNT from backend, using default: 11", error);
            }

            nodeType.prototype.onNodeCreated = function () {
                // Create options for the combo box (1 to MAX_INPUT_COUNT)
                const inputCountOptions = Array.from({ length: MAX_INPUT_COUNT }, (_, i) => (i + 1).toString());

                // Add the inputcount widget as a combo box (dropdown)
                this.addWidget("combo", "inputcount", "1", (value) => {
                    // Ensure inputcount is within the allowed range
                    const inputcount = parseInt(value, 10);
                    if (inputcount < 1 || inputcount > MAX_INPUT_COUNT) {
                        console.error(`Input count must be between 1 and ${MAX_INPUT_COUNT}`);
                        return;
                    }

                    // Update the inputs dynamically
                    this.updateInputs(inputcount);
                }, {
                    values: inputCountOptions,  // List of options (1 to MAX_INPUT_COUNT)
                    default: "1",  // Default value
                });

                // Initialize with the first input (Condition 1)
                this.updateInputs(1);
            };

            // Method to dynamically update inputs
            nodeType.prototype.updateInputs = function (inputcount) {
                // Ensure inputcount is within the allowed range
                if (inputcount < 1 || inputcount > MAX_INPUT_COUNT) {
                    console.error(`Input count must be between 1 and ${MAX_INPUT_COUNT}`);
                    return;
                }

                // Current number of inputs
                const currentInputCount = this.inputs.length;

                // Add or remove inputs based on inputcount
                if (inputcount > currentInputCount) {
                    // Add new inputs
                    for (let i = currentInputCount + 1; i <= inputcount; i++) {
                        const inputName = `Text ${i - 1}`;
                        this.addInput(inputName, "STRING", { multiline: true }); // added { multiline: true }
                    }
                } else if (inputcount < currentInputCount) {
                    // Remove extra inputs
                    for (let i = currentInputCount; i > inputcount; i--) {
                        this.removeInput(i - 1);
                    }
                }

                // Notify the graph that the node has been modified
                if (app.graph) {
                    app.graph.change();
                } else {
                    console.error("app.graph is not available");
                }
            };
        }
    },
    VERSION: "0.5.0",
});
