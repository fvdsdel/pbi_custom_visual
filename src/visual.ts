"use strict";

import powerbi from "powerbi-visuals-api";

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

        if (columns.length === 0) {
            this.renderMessage("Add up to six fields to the visual.");
            return;
        }

        const rowCount = columns.reduce(
            (maximum, column) => Math.max(maximum, column.values.length),
            0
        );

        for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            const record = document.createElement("section");
            record.className = "record";

            const primaryColumn = columns[0];
            const title = this.createTextElement("div", "title", primaryColumn.source.displayName);
            const info = document.createElement("span");
            info.className = "info";
            info.setAttribute("aria-label", `${primaryColumn.source.displayName} information`);
            info.setAttribute("role", "img");
            info.textContent = "i";
            const header = document.createElement("div");
            header.className = "header";
            header.append(title, info);
            const primaryValue = this.createTextElement(
                "div",
                "primary-value",
                this.valueAt(primaryColumn.values, rowIndex)
            );
            const primary = document.createElement("div");
            primary.className = "primary";
            primary.append(header, primaryValue);
            record.appendChild(primary);

            if (columns.length > 1) {
                const change = this.createTextElement(
                    "div",
                    "change",
                    this.valueAt(columns[1].values, rowIndex)
                );
                record.appendChild(change);
            }

            const details = document.createElement("div");
            details.className = "details";

            for (const column of columns.slice(2)) {
                const field = document.createElement("div");
                field.className = "field";

                const label = this.createTextElement("div", "label", column.source.displayName);
                const value = this.createTextElement(
                    "div",
                    "value",
                    this.valueAt(column.values, rowIndex)
                );

                field.append(label, value);
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
