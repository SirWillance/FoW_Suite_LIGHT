import { app } from "../../../../scripts/app.js";

// Version Tracking
const VERSION = "Light";

app.registerExtension({
    name: "FoW_Suite_Light.PromptSplitterLightUI",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLPromptSplitterLight") {
             nodeType.prototype.onNodeCreated = function () {
                const MAX_OUTPUT_COUNT = 7;

                // Dropdown for selecting output count
                const outputOptions = Array.from({ length: MAX_OUTPUT_COUNT }, (_, i) => (i + 1).toString());

                this.addWidget("combo", "inputcount", "1", (value) => {
                    const inputcount = parseInt(value, 10);
                    if (inputcount < 1 || inputcount > MAX_OUTPUT_COUNT) {
                        console.error(`Output count must be between 1 and ${MAX_OUTPUT_COUNT}`);
                        return;
                    }
                    this.updateOutputs(inputcount);
                }, {
                    values: outputOptions,
                    default: "1",
                });

                this.updateOutputs(1);
            };

            nodeType.prototype.updateOutputs = function (outputCount) {
                const MAX_OUTPUT_COUNT = 7;
                const currentOutputCount = this.outputs.length;

                if (outputCount > currentOutputCount) {
                    for (let i = currentOutputCount; i < outputCount; i++) {
                        const outputName = `Prompt Token ${i + 1}`;
                        this.addOutput(outputName, "STRING");
                    }
                } else if (outputCount < currentOutputCount) {
                    for (let i = currentOutputCount; i > outputCount; i--) {
                        this.removeOutput(i - 1);
                    }
                }

                if (app.graph) {
                    app.graph.change();
                } else {
                    console.error("app.graph is not available");
                }
            };
        }
    },
    VERSION: "Light",
});