"use strict";

import powerbi from "powerbi-visuals-api";

import DataView = powerbi.DataView;
import DataViewObjects = powerbi.DataViewObjects;

export interface CardSettings {
    outlineColor: string;
    accentColor: string;
}

export interface FieldTextSettings {
    fontFamily: string;
    fontSize: number;
    color: string;
    bold: boolean;
}

const defaultCardSettings: CardSettings = {
    outlineColor: "#168577",
    accentColor: "#168577"
};

const defaultFieldTextSettings: readonly FieldTextSettings[] = [
    { fontFamily: "Segoe UI", fontSize: 16, color: "#111", bold: true },
    { fontFamily: "Segoe UI", fontSize: 13, color: "#00a651", bold: false },
    { fontFamily: "Segoe UI", fontSize: 11, color: "#111", bold: true },
    { fontFamily: "Segoe UI", fontSize: 11, color: "#111", bold: false },
    { fontFamily: "Segoe UI", fontSize: 11, color: "#111", bold: true },
    { fontFamily: "Segoe UI", fontSize: 11, color: "#111", bold: false }
];

export class VisualSettings {
    public card: CardSettings = { ...defaultCardSettings };
    public field1Formatting: FieldTextSettings = { ...defaultFieldTextSettings[0] };
    public field2Formatting: FieldTextSettings = { ...defaultFieldTextSettings[1] };
    public field3Formatting: FieldTextSettings = { ...defaultFieldTextSettings[2] };
    public field4Formatting: FieldTextSettings = { ...defaultFieldTextSettings[3] };
    public field5Formatting: FieldTextSettings = { ...defaultFieldTextSettings[4] };
    public field6Formatting: FieldTextSettings = { ...defaultFieldTextSettings[5] };

    public static parse(dataView: DataView | undefined): VisualSettings {
        const settings = new VisualSettings();
        const objects = dataView?.metadata?.objects;

        settings.card = {
            outlineColor: colorValue(
                propertyValue(objects, "card", "outlineColor"),
                defaultCardSettings.outlineColor
            ),
            accentColor: colorValue(
                propertyValue(objects, "card", "accentColor"),
                defaultCardSettings.accentColor
            )
        };

        defaultFieldTextSettings.forEach((defaults, index) => {
            settings.setFieldFormatting(
                index,
                parseFieldTextSettings(objects, `field${index + 1}Formatting`, defaults)
            );
        });

        return settings;
    }

    public get fieldTextSettings(): readonly FieldTextSettings[] {
        return [
            this.field1Formatting,
            this.field2Formatting,
            this.field3Formatting,
            this.field4Formatting,
            this.field5Formatting,
            this.field6Formatting
        ];
    }

    private setFieldFormatting(index: number, fieldSettings: FieldTextSettings): void {
        switch (index) {
            case 0:
                this.field1Formatting = fieldSettings;
                break;
            case 1:
                this.field2Formatting = fieldSettings;
                break;
            case 2:
                this.field3Formatting = fieldSettings;
                break;
            case 3:
                this.field4Formatting = fieldSettings;
                break;
            case 4:
                this.field5Formatting = fieldSettings;
                break;
            case 5:
                this.field6Formatting = fieldSettings;
                break;
        }
    }
}

function parseFieldTextSettings(
    objects: DataViewObjects | undefined,
    objectName: string,
    defaults: FieldTextSettings
): FieldTextSettings {
    return {
        fontFamily: stringValue(propertyValue(objects, objectName, "fontFamily"), defaults.fontFamily),
        fontSize: fontSizeValue(propertyValue(objects, objectName, "fontSize"), defaults.fontSize),
        color: colorValue(propertyValue(objects, objectName, "color"), defaults.color),
        bold: booleanValue(propertyValue(objects, objectName, "bold"), defaults.bold)
    };
}

function propertyValue(
    objects: DataViewObjects | undefined,
    objectName: string,
    propertyName: string
): unknown {
    const object = objects?.[objectName];
    return object?.[propertyName];
}

function colorValue(value: unknown, fallback: string): string {
    if (!isRecord(value) || !isRecord(value.solid)) {
        return fallback;
    }

    return typeof value.solid.color === "string" ? value.solid.color : fallback;
}

function stringValue(value: unknown, fallback: string): string {
    return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function fontSizeValue(value: unknown, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
    return typeof value === "boolean" ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}
