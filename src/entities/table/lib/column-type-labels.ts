type KnownColumnType = "PRIMARY_KEY" | "FOREIGN_KEY" | "FOREIGN_KEY_ARRAY";

export const COLUMN_TYPE_LABELS: Record<KnownColumnType, string> = {
	PRIMARY_KEY: "PK",
	FOREIGN_KEY: "FK",
	FOREIGN_KEY_ARRAY: "FK[]",
};

export function getColumnTypeLabel(type: string): string {
	return COLUMN_TYPE_LABELS[type] ?? type;
}
