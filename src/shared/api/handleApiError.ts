import { getTranslation, translations } from "@fsd/shared/i18n";

const defaultT = (path: string): string =>
	getTranslation(translations.en, path);

/**
 * Centralized API error handling
 * @param error - The error object
 * @param response - The response object (optional)
 * @param t - Translation function (optional, defaults to the English dictionary)
 */
export const handleApiError = (
	error: unknown,
	response?: Response,
	t?: (path: string) => string,
): string => {
	const translate = (path: string): string => (t ? t(path) : defaultT(path));

	if (response) {
		switch (response.status) {
			case 401:
				return translate("apiErrors.sessionExpired");
			case 403:
				return translate("apiErrors.noPermission");
			case 404:
				return translate("apiErrors.notFound");
			case 409:
				return translate("apiErrors.alreadyExists");
			case 422:
				return translate("apiErrors.invalidData");
			case 429:
				return translate("apiErrors.tooManyRequests");
			case 500:
			case 502:
			case 503:
				return translate("apiErrors.serverError");
			default:
				return (
					(error as Error)?.message || translate("apiErrors.unknownError")
				);
		}
	}

	if (error instanceof TypeError && error.message.includes("fetch")) {
		return "Error de conexión. Verifica tu internet";
	}

	return (error as Error)?.message || "Error desconocido";
};
