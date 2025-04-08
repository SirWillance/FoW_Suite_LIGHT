import { app } from "../../../../../scripts/app.js";
import { SubjectCategoryModalLight } from "../shared/LightSubjectCategoryModal.js";
import { hideWidgets } from "../shared/WidgetHider.js";

export const VERSION = "Light";

app.registerExtension({
    name: "FoW_Suite_LIGHT.SubjectCategoryUI",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "FoWLSubjectCategory") {
            console.log("Setting to load for", nodeData.name);

            nodeType.prototype.onNodeCreated = function () {
                console.log(`SubjectCategoryUIv${VERSION}: Node created.`);

                const modal = new SubjectCategoryModalLight(this);
                const openModalButton = this.addWidget(
                    "button",
                    "Open Subject Interface",
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

                const widgetNames = ["subject_base", "subject_characteristics", "subject_attire_and_gear", "subject_details"];

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
                    console.log(`SubjectCategoryUI v${VERSION}: Node removed.`);
                    modal.cleanup(this);
                };
            };
        }
    },
   
});
