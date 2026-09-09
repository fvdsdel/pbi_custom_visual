"use strict";

import powerbi from "powerbi-visuals-api";
import { FieldTextSettings, VisualSettings } from "./settings";

import DataView = powerbi.DataView;
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

export class Visual implements IVisual {
    private readonly container: HTMLDivElement;

    constructor(options?: VisualConstructorOptions) {
        this.container = document.createElement("div");
        this.container.className = "six-field-visual";

        if (options) {
            options.element.appendChild(this.container);
        }
    }

    public update(options: VisualUpdateOptions): void {
        this.container.replaceChildren();

        const dataView: DataView | undefined = options.dataViews && options.dataViews[0];
        const categories = dataView?.categorical?.categories ?? [];
        const values = dataView?.categorical?.values ?? [];
        const columns = [...categories, ...values].slice(0, 6);
        const settings = VisualSettings.parse(dataView);
        const cardSettings = settings.card;
        const fieldTextSettings = settings.fieldTextSettings;
        const columnForRole = (role: string) =>
            columns.find((column) => column.source.roles?.[role]);
        const primaryColumn = columnForRole("field1");
        const secondaryColumn = columnForRole("field2");
        const detailColumns = ["field3", "field4", "field5", "field6"].map(columnForRole);

        if (!primaryColumn) {
            this.renderMessage("Add Aantal huidig jaar to the visual.");
            return;
        }

        const rowCount = columns.reduce(
            (maximum, column) => Math.max(maximum, column.values.length),
            0
        );

        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            const record = document.createElement("section");
            record.className = "record";
            record.style.setProperty("--outline-color", cardSettings.outlineColor);
            record.style.setProperty("--accent-color", cardSettings.accentColor);

            const title = this.createTextElement("div", "title", primaryColumn.source.displayName);
            const header = document.createElement("div");
            header.className = "header";
            header.appendChild(title);
            const primaryValue = this.createTextElement(
                "div",
                "primary-value",
                this.valueAt(primaryColumn.values, rowIndex)
            );
            this.applyTextSettings(primaryValue, fieldTextSettings[0]);
            const primary = document.createElement("div");
            primary.className = "primary";
            primary.append(header, primaryValue);
            const summary = document.createElement("div");
            summary.className = "summary";
            summary.style.setProperty("display", "grid", "important");
            summary.style.setProperty(
                "grid-template-columns",
                "minmax(0, 1fr) auto",
                "important"
            );
            summary.style.setProperty("align-items", "end", "important");
            summary.appendChild(primary);

            if (secondaryColumn) {
                const change = this.createTextElement(
                    "div",
                    "change",
                    this.valueAt(secondaryColumn.values, rowIndex)
                );
                this.applyTextSettings(change, fieldTextSettings[1]);
                summary.appendChild(change);
            }
            record.appendChild(summary);

            const details = document.createElement("div");
            details.className = "details";
            details.style.setProperty("display", "grid", "important");
            details.style.setProperty(
                "grid-template-columns",
                "auto minmax(0, 1fr) auto",
                "important"
            );

            for (const [detailIndex, column] of detailColumns.entries()) {
                if (!column) {
                    continue;
                }

                if (detailIndex === 0 || detailIndex === 2) {
                    const rowLabel = this.createTextElement(
                        "div",
                        "row-label",
                        detailIndex === 0 ? "BOL" : "BBL"
                    );
                    rowLabel.style.setProperty("grid-column", "1", "important");
                    rowLabel.style.setProperty("justify-self", "start", "important");
                    rowLabel.style.setProperty("text-align", "left", "important");
                    rowLabel.style.setProperty(
                        "grid-row",
                        String(Math.floor(detailIndex / 2) + 1),
                        "important"
                    );
                    details.appendChild(rowLabel);
                }

                const field = document.createElement("div");
                field.className =
                    detailIndex === 0 || detailIndex === 2 ? "field field-emphasized" : "field";
                field.style.setProperty(
                    "grid-column",
                    String((detailIndex % 2) + 2),
                    "important"
                );
                field.style.setProperty(
                    "grid-row",
                    String(Math.floor(detailIndex / 2) + 1),
                    "important"
                );
                field.style.setProperty(
                    "justify-self",
                    detailIndex % 2 === 0 ? "center" : "end",
                    "important"
                );

                const value = this.createTextElement(
                    "div",
                    "value",
                    this.valueAt(column.values, rowIndex)
                );
                this.applyTextSettings(value, fieldTextSettings[detailIndex + 2]);

                field.appendChild(value);
                details.appendChild(field);
            }

            if (details.childElementCount > 0) {
                record.appendChild(details);
            }

            this.container.appendChild(record);
        }
    }

    private valueAt(values: ReadonlyArray<unknown>, index: number): string {
        const value = values[index];
        return value === null || value === undefined ? "(Blank)" : String(value);
    }

    private applyTextSettings(element: HTMLElement, settings: FieldTextSettings): void {
        element.style.setProperty("font-family", settings.fontFamily, "important");
        element.style.setProperty("font-size", `${settings.fontSize}px`, "important");
        element.style.setProperty("color", settings.color, "important");
        element.style.setProperty("font-weight", settings.bold ? "700" : "400", "important");
    }

    private createTextElement<K extends keyof HTMLElementTagNameMap>(
        tagName: K,
        className: string,
        text: string
    ): HTMLElementTagNameMap[K] {
        const element = document.createElement(tagName);
        element.className = className;
        element.textContent = text;
        return element;
    }

    private renderMessage(message: string): void {
        const placeholder = document.createElement("div");
        placeholder.className = "placeholder";
        placeholder.textContent = message;
        this.container.appendChild(placeholder);
    }
}
