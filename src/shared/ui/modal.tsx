"use client";

import type { ReactNode, MouseEvent } from "react";
import { useEffect, useRef } from "react";
import { cn } from "@fsd/shared/lib/classnames";
import { createPortal } from "react-dom";
import { Button } from "./button";
import { ArrowLeft, X } from "lucide-react";
import { useTranslation } from "@fsd/shared/i18n/use-translation";

interface ModalProps {
  title: string;
  children: ReactNode;
  onSubmit?: () => void | boolean | Promise<void | boolean>;
  open: boolean;
  setOpen: (open: boolean) => void;
  type?: "create" | "update" | "next" | "save" | "delete";
  showCloseButton?: boolean;
  onReturnPreviewsStep?: () => void;
  contentClassName?: string;
}

export function Modal({
  title,
  children,
  onSubmit,
  open,
  setOpen,
  type = "create",
  showCloseButton = true,
  onReturnPreviewsStep,
  contentClassName,
}: ModalProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isInDialog =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!isInDialog) {
      handleClose();
    }
  };

  const handleSubmit = async () => {
    const result = await onSubmit?.();
    if (result !== false) {
      handleClose();
    }
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="backdrop:bg-black/80 backdrop:backdrop-blur-sm bg-transparent p-0 max-w-none max-h-none m-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-[730px] bg-secondary-gray border-2 border-gray rounded-lg p-6 relative",
          contentClassName,
        )}
      >
        {/* Header */}
        <div className="my-4 relative flex items-center justify-center">
          {onReturnPreviewsStep && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onReturnPreviewsStep}
              className="absolute left-0 top-0"
            >
              <ArrowLeft className="text-secondary-white size-[26px]" />
            </Button>
          )}
          <h2 className="text-white text-h3 font-semibold">{title}</h2>
          {showCloseButton && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClose}
              aria-label="Close modal"
              className="absolute right-0 top-0"
            >
              <X className="text-secondary-white size-[26px]" />
            </Button>
          )}
        </div>

        {/* Separator */}
        <div className="w-full h-[2px] bg-gray mb-4" />

        {/* Content */}
        <div className="my-4">{children}</div>

        {/* Footer */}
        <div className="flex justify-self-end gap-4 mt-6">
          <Button
            variant="danger"
            type="button"
            onClick={handleClose}
            className="w-[6rem] cursor-pointer !text-h3"
          >
            {t("common.cancel")}
          </Button>

          <Button
            variant="success"
            type="button"
            onClick={handleSubmit}
            className="w-[6rem] cursor-pointer !text-h3"
          >
            {
              {
                create: t("common.create"),
                update: t("common.update"),
                next: t("common.next"),
                delete: t("common.delete"),
                save: t("common.save"),
              }[type]
            }
          </Button>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
