// WidgetHider.js
export const hideWidgets = (node, widgetNames) => {
    if (!node || !widgetNames || !Array.isArray(widgetNames)) {
        console.error("Invalid input to hideWidgets:", { node, widgetNames });
        return;
    }

    widgetNames.forEach(widgetName => {
        const widget = node.widgets.find(w => w.name === widgetName);
        if (widget) {
            // Mark the widget as hidden for LiteGraph
            widget.hidden = true;

            // Prevent the widget from rendering
            widget.draw = function (ctx, node, widget_width, y, H) {
                // Do nothing to prevent rendering
            };

            // Ensure the widget doesn't contribute to the node's size
            widget.computeSize = function () {
                return [0, 0];
            };
            widget.height = 0;
            widget.width = 0;

            // Hide the widget's DOM element (if it exists)
            if (widget.element) {
                widget.element.style.display = "none";
                widget.element.style.visibility = "hidden";
                widget.element.style.height = "0px";
                widget.element.style.width = "0px";
                widget.element.style.overflow = "hidden";
                widget.element.style.position = "absolute";
                widget.element.style.left = "-9999px";
            }

            // Ensure the widget has a callback to handle updates (if needed)
            if (!widget.callback) {
                widget.callback = (value) => {
                    console.log(`${widgetName} updated:`, value);
                    if (node.onUpdate) node.onUpdate();
                };
            }

            console.log(`Hid widget: ${widgetName}`);
        } else {
            console.warn(`Widget ${widgetName} not found in node ${node.type}`);
        }
    });

    // Force a redraw to ensure the UI updates
    if (node.setDirtyCanvas) {
        node.setDirtyCanvas(true, true);
    }
};