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
    backgroundColor?: string;
    cornerRadius?: number;
}

export interface RowLabelSettings {
    fontSize: number;
}

const defaultCardSettings: CardSettings = {
    outlineColor: "#168577",
    accentColor: "#168577"
};

const defaultRowLabelSettings: RowLabelSettings = {
    fontSize: 9
};

const defaultFieldTextSettings: readonly FieldTextSettings[] = [
    { fontFamily: "Segoe UI", fontSize: 16, color: "#111", bold: true },
    {
        fontFamily: "Segoe UI",
        fontSize: 13,
        color: "#00a651",
        bold: false,
        backgroundColor: "transparent",
        cornerRadius: 5
    },
    { fontFamily: "Segoe UI", fontSize: 11, color: "#111", bold: true },
    {
        fontFamily: "Segoe UI",
        fontSize: 11,
        color: "#111",
        bold: false,
        backgroundColor: "transparent",
        cornerRadius: 5
    },
    { fontFamily: "Segoe UI", fontSize: 11, color: "#111", bold: true },
    {
        fontFamily: "Segoe UI",
        fontSize: 11,
        color: "#111",
        bold: false,
        backgroundColor: "transparent",
        cornerRadius: 5
    }
];

export class VisualSettings {
    public card: CardSettings = { ...defaultCardSettings };
    public rowLabels: RowLabelSettings = { ...defaultRowLabelSettings };
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
        settings.rowLabels = {
            fontSize: fontSizeValue(
                propertyValue(objects, "rowLabels", "fontSize"),
                defaultRowLabelSettings.fontSize
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

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return {
            cards: [
                this.createCardFormattingCard(),
                this.createRowLabelsFormattingCard(),
                ...this.fieldTextSettings.map((settings, index) =>
                    this.createFieldFormattingCard(index + 1, settings)
                )
            ]
        };
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

    private createCardFormattingCard(): powerbi.visuals.FormattingCard {
        return {
            uid: "card",
            displayName: "Card",
            groups: [
                {
                    uid: "cardColors",
                    displayName: "Colors",
                    slices: [
                        this.createColorPickerSlice(
                            "card",
                            "outlineColor",
                            "Outline color",
                            this.card.outlineColor
                        ),
                        this.createColorPickerSlice(
                            "card",
                            "accentColor",
                            "Bottom accent color",
                            this.card.accentColor
                        )
                    ]
                }
            ],
            revertToDefaultDescriptors: [
                this.createDescriptor("card", "outlineColor"),
                this.createDescriptor("card", "accentColor")
            ]
        };
    }

    private createRowLabelsFormattingCard(): powerbi.visuals.FormattingCard {
        return {
            uid: "rowLabels",
            displayName: "Row labels",
            groups: [
                {
                    uid: "rowLabelsText",
                    displayName: "Text",
                    slices: [
                        {
                            uid: "rowLabelsFontSize",
                            displayName: "Font size",
                            control: {
                                type: powerbi.visuals.FormattingComponent.NumUpDown,
                                properties: {
                                    descriptor: this.createDescriptor("rowLabels", "fontSize"),
                                    value: this.rowLabels.fontSize
                                }
                            }
                        }
                    ]
                }
            ],
            revertToDefaultDescriptors: [this.createDescriptor("rowLabels", "fontSize")]
        };
    }

    private createFieldFormattingCard(
        fieldNumber: number,
        settings: FieldTextSettings
    ): powerbi.visuals.FormattingCard {
        const objectName = `field${fieldNumber}Formatting`;

        return {
            uid: objectName,
            displayName: `Field ${fieldNumber}`,
            groups: [
                {
                    uid: `${objectName}Text`,
                    displayName: "Text",
                    slices: [
                        {
                            uid: `${objectName}Font`,
                            displayName: "Font",
                            control: {
                                type: powerbi.visuals.FormattingComponent.FontControl,
                                properties: {
                                    fontFamily: {
                                        descriptor: this.createDescriptor(objectName, "fontFamily"),
                                        value: settings.fontFamily
                                    },
                                    fontSize: {
                                        descriptor: this.createDescriptor(objectName, "fontSize"),
                                        value: settings.fontSize
                                    },
                                    bold: {
                                        descriptor: this.createDescriptor(objectName, "bold"),
                                        value: settings.bold
                                    }
                                }
                            }
                        },
                        this.createColorPickerSlice(
                            objectName,
                            "color",
                            "Color",
                            settings.color,
                            true
                        )
                    ]
                },
                ...(settings.backgroundColor === undefined
                    ? []
                    : [
                          {
                              uid: `${objectName}Background`,
                              displayName: "Background",
                              slices: [
                                  this.createColorPickerSlice(
                                      objectName,
                                      "backgroundColor",
                                      "Color",
                                      settings.backgroundColor,
                                      true
                                  ),
                                  {
                                      uid: `${objectName}CornerRadius`,
                                      displayName: "Corner radius",
                                      control: {
                                          type: powerbi.visuals.FormattingComponent.NumUpDown,
                                          properties: {
                                              descriptor: this.createDescriptor(
                                                  objectName,
                                                  "cornerRadius"
                                              ),
                                              value: settings.cornerRadius ?? 5
                                          }
                                      }
                                  }
                              ]
                          }
                      ])
            ],
            revertToDefaultDescriptors: [
                this.createDescriptor(objectName, "fontFamily"),
                this.createDescriptor(objectName, "fontSize"),
                this.createDescriptor(objectName, "color"),
                this.createDescriptor(objectName, "bold"),
                ...(settings.backgroundColor === undefined
                    ? []
                    : [
                          this.createDescriptor(objectName, "backgroundColor"),
                          this.createDescriptor(objectName, "cornerRadius")
                      ])
            ]
        };
    }

    private createColorPickerSlice(
        objectName: string,
        propertyName: string,
        displayName: string,
        color: string,
        supportsConditionalFormatting = false
    ): powerbi.visuals.FormattingSlice {
        const descriptor = this.createDescriptor(objectName, propertyName);

        if (supportsConditionalFormatting) {
            descriptor.instanceKind =
                powerbi.VisualEnumerationInstanceKinds.ConstantOrRule;
        }

        return {
            uid: `${objectName}${propertyName}`,
            displayName,
            control: {
                type: powerbi.visuals.FormattingComponent.ColorPicker,
                properties: {
                    descriptor,
                    value: { value: color }
                }
            }
        };
    }

    private createDescriptor(
        objectName: string,
        propertyName: string
    ): powerbi.visuals.FormattingDescriptor {
        return { objectName, propertyName };
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
        bold: booleanValue(propertyValue(objects, objectName, "bold"), defaults.bold),
        ...(defaults.backgroundColor === undefined
            ? {}
            : {
                  backgroundColor: colorValue(
                      propertyValue(objects, objectName, "backgroundColor"),
                      defaults.backgroundColor
                  ),
                  cornerRadius: cornerRadiusValue(
                      propertyValue(objects, objectName, "cornerRadius"),
                      defaults.cornerRadius ?? 0
                  )
              })
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

function cornerRadiusValue(value: unknown, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
    return typeof value === "boolean" ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}
