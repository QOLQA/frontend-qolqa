import { en } from "./en";
import { es } from "./es";

export type Locale = "en" | "es";

export const translations = {
	en,
	es,
} as const;

// Default locale is English
export const defaultLocale: Locale = "en";

export type TranslationValue = string | { [key: string]: TranslationValue };
export type TranslationDict = { [key: string]: TranslationValue };

// Helper function to get nested translation value
export function getTranslation(dict: TranslationDict, path: string): string {
	const keys = path.split(".");
	let value: TranslationValue = dict;

	for (const key of keys) {
		if (value && typeof value === "object" && key in value) {
			value = value[key];
		} else {
			return path; // Return path if translation not found
		}
	}

	return typeof value === "string" ? value : path;
}

// Hook-like function to get translations (can be used in both client and server)
export function useTranslation(locale: Locale = defaultLocale) {
	const t = translations[locale] || translations[defaultLocale];

	return {
		t: (path: string) => getTranslation(t as TranslationDict, path),
		locale,
	};
}
