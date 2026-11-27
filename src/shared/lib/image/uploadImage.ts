/**
 * Cloudinary image upload from the browser.
 *
 * The api secret lives on the server only: this module asks
 * `POST /api/cloudinary/sign` (same-origin, httpOnly session) for a signature of
 * the params it wants, then uploads the bytes straight to Cloudinary, so no
 * image data travels through the Next.js server.
 */

import { fetchWithAuth } from "@fsd/shared/api";

/** Public: cloud name + upload endpoint. The secret is never read here. */
const CLOUDINARY_URL = process.env.NEXT_PUBLIC_CLOUDINARY_URL || "";

/** Relative to the BFF base, so it resolves to `/api/cloudinary/sign`. */
const SIGN_ENDPOINT = "/cloudinary/sign";

interface CloudinarySignature {
	signature: string;
	timestamp: string;
	api_key: string;
	cloud_name: string;
	/** Echo of the exact params the server signed; they go into the form as-is. */
	params: Record<string, string>;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const isCloudinarySignature = (body: unknown): body is CloudinarySignature => {
	if (!isRecord(body) || !isRecord(body.params)) return false;

	return (
		typeof body.signature === "string" &&
		typeof body.timestamp === "string" &&
		typeof body.api_key === "string" &&
		typeof body.cloud_name === "string" &&
		Object.values(body.params).every((value) => typeof value === "string")
	);
};

const readImageBlob = async (imageData: string): Promise<Blob> => {
	const response = await fetch(imageData);
	if (!response.ok) {
		throw new Error(`Failed to fetch image: ${response.statusText}`);
	}
	return response.blob();
};

const requestSignature = async (
	publicId: string,
): Promise<CloudinarySignature> => {
	const response = await fetchWithAuth(SIGN_ENDPOINT, {
		method: "POST",
		body: JSON.stringify({ publicId }),
		credentials: "same-origin",
	});

	if (!response.ok) {
		throw new Error(
			`Cloudinary signature request failed: ${response.status} ${response.statusText}`,
		);
	}

	const body: unknown = await response.json().catch(() => null);
	if (!isCloudinarySignature(body)) {
		throw new Error("Cloudinary signature response is invalid");
	}

	return body;
};

export const uploadImage = async (
	imageData: string,
	solutionId: string,
): Promise<string> => {
	if (!CLOUDINARY_URL) {
		throw new Error(
			"Cloudinary configuration is missing. Image upload is disabled.",
		);
	}

	try {
		const blob = await readImageBlob(imageData);
		const file = new File([blob], `${solutionId}.png`, {
			type: "image/png",
		});

		const signature = await requestSignature(solutionId);

		const formData = new FormData();
		formData.append("file", file);
		// The params come back signed, so they are appended without recomputing anything.
		for (const [key, value] of Object.entries(signature.params)) {
			formData.append(key, value);
		}
		formData.append("api_key", signature.api_key);
		formData.append("signature", signature.signature);

		const uploadResponse = await fetch(CLOUDINARY_URL, {
			method: "POST",
			body: formData,
		});

		if (!uploadResponse.ok) {
			throw new Error(
				`Cloudinary upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
			);
		}

		const data: unknown = await uploadResponse.json();
		if (!isRecord(data) || typeof data.secure_url !== "string") {
			throw new Error("Cloudinary response missing secure_url");
		}

		return data.secure_url;
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error("Image upload failed");
	}
};
