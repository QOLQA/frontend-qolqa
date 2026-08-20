"use client";

import { Handle, Position } from "@xyflow/react";
import type { NodeTypes } from "@xyflow/react";
import { useTheme } from "next-themes";

import type { TableNodeProps } from "@fsd/entities/solution";
import { getCanvasThemeColors } from "@fsd/shared/lib/xyflow/canvas-theme-colors";
import { TableNodeContent } from "./table-node-content";

export const TableNode = ({ data, id }: TableNodeProps) => {
	const { resolvedTheme } = useTheme();
	const canvasColors = getCanvasThemeColors(resolvedTheme);

	return (
		<div className="relative w-full h-full ">
			<Handle
				type="target"
				position={Position.Bottom}
				id="target-center"
				style={{
					width: "65%",
					height: "calc(100% - 57px)",
					background: "transparent",
					border: "none",
					borderRadius: 0,
					transform: "translate(-77%, 0%)",
					cursor: "crosshair",
					zIndex: 10,
				}}
			/>

			<Handle
				type="source"
				position={Position.Right}
				className="group"
				style={{
					width: "64px",
					height: "64px",
					background: "transparent",
					border: "none",
					borderRadius: 0,
					right: "-32px",
					top: "50%",
					transform: "translateY(-50%)",
					cursor: "crosshair",
					zIndex: 10,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<div
					className="group-hover:bg-blue group-hover:border-blue group-hover:scale-125 group-hover:shadow-[0_0_0_4px_rgba(0,82,204,0.2)]"
					style={{
						width: "12px",
						height: "12px",
						borderRadius: "50%",
						background: canvasColors.handleBackground,
						border: `2px solid ${canvasColors.handleBorder}`,
						transition: "all 0.2s ease",
					}}
				/>
			</Handle>

			<TableNodeContent data={data} id={id} />
		</div>
	);
};

export const nodeTypes = {
	table: TableNode,
} satisfies NodeTypes;
