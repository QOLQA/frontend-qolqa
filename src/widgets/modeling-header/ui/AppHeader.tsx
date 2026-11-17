"use client";

import type { SolutionListItem } from "@fsd/entities/solution";
import { Logo } from "@fsd/shared/ui/logo";
import {
  ButtonDuplicateVersion,
  ButtonSave,
  VersionDropdown,
} from "@fsd/features/version-management";
import { ProjectSwitcher } from "@fsd/features/project-management";

type AppHeaderProps = {
  title: string;
  projectId: string;
  projects: SolutionListItem[];
};

export const AppHeader = ({ title, projectId, projects }: AppHeaderProps) => {
  return (
    <header className="flex flex-row items-center w-full h-16 bg-secondary-gray p-4 text-white relative">
      <div className="flex-shrink-0">
        <div className="flex items-center gap-8">
          <Logo className="inline-block" logoClassName="text-blue w-28" />
          <div className="flex items-center gap-3">
            <div data-tour="version-dropdown">
              <VersionDropdown />
            </div>
            <div data-tour="version-duplicate" className="flex">
              <ButtonDuplicateVersion />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-8">
          {/* Undo / redo arrows: hidden until they have a behaviour.
          <div className="flex items-center gap-4">
            <ArrowLeft className="text-white" />
            <ArrowRight className="text-white" />
          </div>
          */}
          <div className="flex items-center gap-3">
            <h1 className="text-h4 text-white">{title}</h1>
            <ProjectSwitcher projects={projects} currentProjectId={projectId} />
          </div>
        </div>
      </div>

      <div data-tour="save-btn" className="flex flex-shrink-0 ml-auto">
        <ButtonSave />
      </div>
    </header>
  );
};
