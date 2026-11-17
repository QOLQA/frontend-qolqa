import { transformSolutionModel } from "@fsd/entities/solution/lib/conversions";
import { getSolutionRequest, getSolutionsRequest } from "@fsd/entities/solution/api";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function getDiagramData(solutionId: string) {
	try {
		const [data, projects] = await Promise.all([
			getSolutionRequest(solutionId),
			getSolutionsRequest(),
		]);
		return { ...transformSolutionModel(data), projects };
	} catch (error) {
		// Re-lanzar errores de redirect inmediatamente para que Next.js los maneje
		if (isRedirectError(error)) {
			throw error;
		}
		
		if (error instanceof Error) {
			if (error.message === "UNAUTHORIZED") {
				redirect("/login");
			}
			if (error.message === "FORBIDDEN") {
				redirect("/projects");
			}
		}
		throw error;
	}
}
