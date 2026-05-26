"use client";

import React, { useCallback, useState } from "react";
import { ManagedDropdownMenu } from "@fsd/shared/ui/ManagedDropdownMenu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@fsd/shared/ui/dropdown-menu";
import {
  type CardinalityType,
  CARDINALITY_OPTIONS,
} from "@fsd/entities/solution";
import { useEditEdgeCardinality } from "../../model/use-edit-edge-cardinality";
import { Trash } from "lucide-react";
import { ModalDeleteEdge } from "../modals/ModalDeleteEdge";
import { useTranslation } from "@fsd/shared/i18n/use-translation";

interface CardinalityLabelProps {
  edgeId: string;
  labelX: number;
  labelY: number;
  cardinality: CardinalityType;
}

export const CardinalityLabel = React.memo(
  ({ edgeId, labelX, labelY, cardinality }: CardinalityLabelProps) => {
    const { handleCardinalityChange } = useEditEdgeCardinality(edgeId);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { t } = useTranslation();

    const handleClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
    }, []);

    const handleDeleteClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
      setIsModalOpen(false);
    }, []);

    return (
      <>
        <foreignObject
          width={170}
          height={40}
          x={labelX - 85}
          y={labelY - 20}
          className="overflow-visible pointer-events-auto"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div
            className="flex items-center justify-center w-full h-full gap-2"
            onClick={handleClick}
          >
            <ManagedDropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="px-2 py-1 text-lighter-gray text-p-lg bg-terciary-gray hover:bg-secondary-gray/80 rounded cursor-pointer transition-colors duration-200 border-none outline-none focus:ring-1 focus:ring-lighter-gray/50"
                  onClick={handleClick}
                >
                  {cardinality}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="z-50 min-w-[70px]"
                side="top"
                align="center"
                variant="menu-1"
              >
                {CARDINALITY_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    type="normal"
                    onClick={() => handleCardinalityChange(option)}
                    className={
                      option === cardinality
                        ? "bg-gray text-white"
                        : "text-lighter-gray"
                    }
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </ManagedDropdownMenu>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="flex items-center justify-center w-8 h-8 bg-terciary-gray text-lighter-gray hover:bg-secondary-gray/80 hover:text-red-600 cursor-pointer rounded transition-colors duration-200 appearance-none webkit-appearance-none transform-gpu"
              aria-label={t("modals.deleteEdge.deleteButtonAriaLabel")}
            >
              <Trash className="size-4" />
            </button>
          </div>
        </foreignObject>
        <ModalDeleteEdge
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          edgeId={edgeId}
        />
      </>
    );
  },
);

CardinalityLabel.displayName = "CardinalityLabel";
