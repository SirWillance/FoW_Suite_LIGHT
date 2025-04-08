import { app } from "../../../../../scripts/app.js";
import { EnvironmentCategoryModalLight } from "../shared/LightEnvironmentCategoryModal.js";
import { hideWidgets } from "../shared/WidgetHider.js";

export const VERSION = "Light";

app.registerExtension({
    name: "FoW_Suite_LIGHT.EnvironmentCategoryUI",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLEnvironmentCategory") {
            console.log("Setting to load for", nodeData.name);

            nodeType.prototype.onNodeCreated = function () {
                console.log(`EnvironmentCategoryUI v${VERSION}: Node created.`);

                const modal = new EnvironmentCategoryModalLight(this);
                const openModalButton = this.addWidget(
                    "button",
                    "Open Environment Interface",
                    "open_editor",
                    () => {
                        try {
                            modal.create(this);
                        } catch (error) {
                            console.error("Error creating modal:", error);
                        }
                    }
                );

                this.openModalButton = openModalButton;

                const widgetNames = ["environment_setting", "environment_structure_props", "environment_elements_lighting"];

                widgetNames.forEach(widgetName => {
                    const userInputWidget = this.widgets.find(w => w.name === widgetName);
                    if (userInputWidget) {
                        userInputWidget.callback = (value) => {
                            console.log(`${widgetName} updated:`, value);
                            if (this.onUpdate) this.onUpdate();
                        };
                    }
                    // Use the global utility to hide the widgets
                    hideWidgets(this, widgetNames);
                });

                this.onRemoved = () => {
                    console.log(`EnvironmentCategoryUI v${VERSION}: Node removed.`);
                    modal.cleanup(this);
                };
            };
        }
    },

});