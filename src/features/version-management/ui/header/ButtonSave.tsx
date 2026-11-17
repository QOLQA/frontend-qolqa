import { Save } from "@fsd/shared/ui/icons/HeaderIcons";
import { saveCanvas, saveSolution } from "../../lib";
import { useSolutionStore } from "@fsd/entities/solution";
import { useQueriesStore } from "@fsd/entities/query";
import { getNodesBounds, getViewportForBounds } from "@xyflow/react";
import { toPng } from "html-to-image";
import { uploadImage } from "@fsd/shared/lib/image";
import { toast } from "sonner";
import { useTranslation } from "@fsd/shared/i18n/use-translation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@fsd/shared/ui/tooltip";

const imageWidth = 1024;
const imageHeight = 768;

export const ButtonSave = () => {
	const { t } = useTranslation();
	const Id = useSolutionStore((state) => state.id);
	const versionId = useSolutionStore((state) => state.selectedVersionId);
	const nodes = useSolutionStore((state) => state.nodes);
	const queries = useQueriesStore((state) => state.queries);

	const handleSave = async () => {
		try {
			await Promise.all([
				saveCanvas(Id, versionId, undefined, false),
				(async () => {
					let secureUrl: string;
					try {
						secureUrl = await generateImage();
					} catch (imageError) {
						console.error("Error generating image:", imageError);
						return;
					}
					await saveSolution(Id, queries, secureUrl);
				})(),
			]);

			toast.success(t("toasts.canvasSaved"));
		} catch (error) {
			console.error("Error saving:", error);
			toast.error(t("toasts.errorSavingCanvas"));
		}
	};

	const generateImage = async () => {
		const nodesBounds = getNodesBounds(nodes);

		const paddingX = imageWidth * 0.15;
		const paddingY = imageHeight * 0.15;

		const paddedBounds = {
			x: nodesBounds.x - paddingX,
			y: nodesBounds.y - paddingY,
			width: nodesBounds.width + paddingX * 2,
			height: nodesBounds.height + paddingY * 2,
		};

		const viewport = getViewportForBounds(
			paddedBounds,
			imageWidth,
			imageHeight,
			0.8,
			1.2,
			200
		);

		const pngString = await toPng(
			document.querySelector(".react-flow__viewport") as HTMLElement,
			{
				width: imageWidth,
				height: imageHeight,
				pixelRatio: 3,
				style: {
					width: `${imageWidth}px`,
					height: `${imageHeight}px`,
					transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
					aspectRatio: `${imageWidth} / ${imageHeight}`,
				},
				skipFonts: true,
			}
		);

		const imageUrl = await uploadImage(pngString, Id);
		return imageUrl;
	};

	return (
		<Tooltip delayDuration={300}>
			<TooltipTrigger asChild>
				<button
					type="button"
					className="group cursor-pointer"
					onClick={handleSave}
					aria-label={t("header.saveChanges")}
				>
					<Save className="text-icon-muted cursor-pointer group-hover:text-icon-intense transition-colors duration-300" />
				</button>
			</TooltipTrigger>
			<TooltipContent side="bottom" sideOffset={6}>
				{t("header.saveChanges")}
			</TooltipContent>
		</Tooltip>
	);
};
