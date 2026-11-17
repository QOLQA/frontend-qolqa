"use client";

import Link from "next/link";
import type { SolutionListItem } from "@fsd/entities/solution";
import { useTranslation } from "@fsd/shared/i18n/use-translation";
import { ManagedDropdownMenu } from "@fsd/shared/ui/ManagedDropdownMenu";
import {
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@fsd/shared/ui/dropdown-menu";
import { Chevron } from "@fsd/shared/ui/icons/HeaderIcons";

type ProjectSwitcherProps = {
	projects: SolutionListItem[];
	currentProjectId: string;
};

/** Chevron menu listing the user's other projects to jump between them. */
export function ProjectSwitcher({ projects, currentProjectId }: ProjectSwitcherProps) {
	const { t } = useTranslation();
	const otherProjects = projects.filter((project) => project._id !== currentProjectId);

	return (
		<ManagedDropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="group cursor-pointer"
					aria-label={t("header.switchProject")}
					title={t("header.switchProject")}
				>
					<Chevron className="text-white transition-colors group-hover:text-icon-intense" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="center"
				variant="menu-1"
				className="max-h-80 w-64 custom-scrollbar"
			>
				{otherProjects.length === 0 ? (
					<DropdownMenuItem type="normal" disabled>
						{t("header.noOtherProjects")}
					</DropdownMenuItem>
				) : (
					otherProjects.map((project) => (
						<DropdownMenuItem key={project._id} type="normal" asChild>
							<Link href={`/projects/${project._id}/modeling`}>
								<span className="truncate">{project.name}</span>
							</Link>
						</DropdownMenuItem>
					))
				)}
			</DropdownMenuContent>
		</ManagedDropdownMenu>
	);
}
