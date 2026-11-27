import { api } from "@fsd/shared/api";
import type { Query } from "@fsd/entities/solution";

/**
 * Client-driven read: the queries editor needs the list while it is interactive,
 * so it rides the `/api` BFF proxy. Mutations are server actions
 * (`features/query-management/model/actions.ts`).
 */
export async function getQueriesBySolutionRequest(
	solutionId: string,
): Promise<Query[]> {
	return api.get<Query[]>(`/queries/solution/${solutionId}`);
}
