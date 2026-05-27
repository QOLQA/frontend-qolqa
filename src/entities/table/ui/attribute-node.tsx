"use client";

import { ManagedDropdownMenu } from "@fsd/shared/ui/ManagedDropdownMenu";
import type { Column } from "@fsd/entities/solution";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@fsd/shared/ui/dropdown-menu";
import { MoreButton } from "@fsd/shared/ui/MoreButton";
import { Delete, Edit } from "@fsd/shared/ui/icons/TableOptionsIcons";
import { getColumnTypeLabel } from "@fsd/entities/table/lib";

interface AttributeNodeProps {
  column: Column;
  columnId: string;
  handleEdit: (column: Column) => void;
  handleDelete: (columnId: string) => void;
  handleToggleFkArray?: (columnId: string) => void;
}

export function AttributeNode({
  column,
  columnId,
  handleEdit,
  handleDelete,
  handleToggleFkArray,
}: AttributeNodeProps) {
  const isFkColumn =
    column.type === "FOREIGN_KEY" || column.type === "FOREIGN_KEY_ARRAY";

  return (
    <div className="table-attribute">
      <span className="text-white">{column.name}</span>
      <div>
        <span className="text-lighter-gray">
          {getColumnTypeLabel(column.type)}
        </span>
        <div className="table-attribute__options">
          <ManagedDropdownMenu>
            {column.type !== "PRIMARY_KEY" ? (
              <DropdownMenuTrigger asChild>
                <MoreButton
                  className="text-lighter-gray"
                  onClick={(e) => e.stopPropagation()}
                />
              </DropdownMenuTrigger>
            ) : (
              <div className="w-9 h-8" />
            )}
            <DropdownMenuContent
              className="z-50"
              side="right"
              variant="menu-1"
            >
              {isFkColumn ? (
                <DropdownMenuItem
                  type="normal"
                  onClick={() => handleToggleFkArray?.(columnId)}
                >
                  Toggle array
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem type="normal" onClick={() => handleEdit(column)}>
                    <Edit className="text-white" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray" />
                  <DropdownMenuItem
                    type="delete"
                    className="text-red"
                    onClick={() => handleDelete(columnId)}
                  >
                    <Delete className="text-red" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </ManagedDropdownMenu>
        </div>
      </div>
    </div>
  );
}
