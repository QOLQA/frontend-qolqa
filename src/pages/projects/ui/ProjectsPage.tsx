"use client";

import { Button } from "@fsd/shared/ui/button";
import { Plus, LogOut } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@fsd/features/auth";
import { Logo } from "@fsd/shared/ui/logo";
import { useTranslation } from "@fsd/shared/i18n/use-translation";
import {
  AddProjectModal,
  EditProjectModal,
  DeleteProjectModal,
  useProjectsStore,
} from "@fsd/features/project-management";
import { SolutionCard, type SolutionListItem } from "@fsd/entities/solution";
import { TourBanner } from "@fsd/features/onboarding-tour";
import {
  createPracticeSolution,
  createSolution,
  deleteSolution,
  updateSolution,
} from "../model/actions";

export function ProjectsPage({
  initialSolutions,
}: {
  initialSolutions: SolutionListItem[];
}) {
  const { t } = useTranslation();
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] =
    useState(false);

  const router = useRouter();
  const { user, logout } = useAuthContext();

  const [isPending, startTransition] = useTransition();

  const { solutionId } = useProjectsStore.getState();

  const handleAddSolution = async (name: string) => {
    setIsAddProjectModalOpen(false);

    const result = await createSolution(name);
    if (!result.ok) return;

    router.push(`/projects/${result.data._id}/modeling`);
  };

  const handleCreatePracticeProject = async (name: string) => {
    const result = await createPracticeSolution(name);
    return result.ok ? result.data : null;
  };

  const handleRequestDeleteSolution = (solutionId: string) => {
    useProjectsStore.getState().setSolutionId(solutionId);
    setIsDeleteProjectModalOpen(true);
  };

  const handleRequestEditSolution = (solutionId: string) => {
    useProjectsStore.getState().setSolutionId(solutionId);
    setIsEditProjectModalOpen(true);
  };

  const handleOpenSolution = (solutionId: string) => {
    router.push(`/projects/${solutionId}/modeling`);
  };

  const handleConfirmDeleteSolution = async () => {
    if (!solutionId) return;

    await deleteSolution(solutionId);
    // The action revalidates the list on success; a failure also resyncs so the
    // UI never keeps a card the server no longer has (or hides one it still has).
    router.refresh();
  };

  const handleEditSolution = async () => {
    const { solutionId: sid, solutionDataToEdit } = useProjectsStore.getState();
    if (!sid) return;

    await updateSolution(sid, solutionDataToEdit?.name ?? "");
    router.refresh();
  };

  const handleLogout = () => {
    startTransition(() => {
      logout();
    });
  };

  return (
    <>
      <header className="bg-secondary-gray pt-[27px] pb-16">
        <div className="max-w-[1330px] mx-auto flex justify-between items-center">
          <Logo
            className="inline-block cursor-pointer"
            logoClassName="text-blue w-36 h-16"
          />
          <div className="flex gap-[68px] items-center">
            <Button
              type="button"
              onClick={() => {
                setIsAddProjectModalOpen(true);
              }}
              className="text-white dark:text-white font-weight-900 cursor-pointer bg-black hover:bg-primary-gray"
            >
              <Plus /> {t("other.newProject")}
            </Button>
            <div className="flex items-center gap-3">
              {user && (
                <span className="text-white text-sm">{user.username}</span>
              )}
              <Button
                className="rounded-full"
                size="icon"
                onClick={handleLogout}
                title={t("common.logOut")}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="bg-secondary-gray pb-36 min-h-[90vh]">
        <div className="max-w-[1330px] mx-auto">
          <h1 className="text-center text-white text-h2">
            {t("other.yourProjects")}
          </h1>
          <hr className="mt-[33px] mb-20 border-gray" />

          <TourBanner
            hasProjects={initialSolutions.length > 0}
            onCreatePracticeProject={handleCreatePracticeProject}
            onOpenProject={handleOpenSolution}
          />

          {isPending && (
            <div className="text-center text-white mb-4">
              <p className="text-sm">{t("common.loading")}</p>
            </div>
          )}

          <ul className="projects grid grid-cols-3 gap-10">
            {initialSolutions.map((solution) => (
              <SolutionCard
                {...solution}
                key={solution._id}
                onRequestDelete={handleRequestDeleteSolution}
                onRequestEdit={handleRequestEditSolution}
                onOpen={handleOpenSolution}
              />
            ))}
          </ul>
        </div>
      </main>

      {isAddProjectModalOpen && (
        <AddProjectModal
          open={isAddProjectModalOpen}
          setOpen={setIsAddProjectModalOpen}
          onSubmit={handleAddSolution}
        />
      )}

      {isDeleteProjectModalOpen && (
        <DeleteProjectModal
          open={isDeleteProjectModalOpen}
          setOpen={setIsDeleteProjectModalOpen}
          onConfirm={handleConfirmDeleteSolution}
          solutionName={initialSolutions.find((s) => s._id === solutionId)?.name}
        />
      )}

      {isEditProjectModalOpen && (
        <EditProjectModal
          open={isEditProjectModalOpen}
          setOpen={setIsEditProjectModalOpen}
          onSubmit={handleEditSolution}
          solutionNameToEdit={
            initialSolutions.find((s) => s._id === solutionId)?.name ?? ""
          }
        />
      )}
    </>
  );
}
