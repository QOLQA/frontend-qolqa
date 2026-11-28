"use client";

import React, { type ReactNode } from "react";
import { Check, X } from "lucide-react";
import type { Query } from "@fsd/entities/solution";
import { useTranslation } from "@fsd/shared/i18n/use-translation";
import { cn } from "@fsd/shared/lib/classnames";

type QueryItemProps = {
	query: Query;
	actionsSlot?: ReactNode;
	isHandled?: boolean;
};

const WordSelector = ({ word }: { word: string }) => {
	return <span className="text-blue">{`${word} `} </span>;
};

export const QueryItem = ({ query, actionsSlot, isHandled }: QueryItemProps) => {
	const { t } = useTranslation();
	const satisfactionLabel =
		isHandled === true
			? t("other.querySatisfied")
			: t("other.queryNotSatisfied");

	return (
		<div className="flex flex-col items-start bg-terciary-gray border border-gray w-full p-4 gap-3 rounded-lg relative">
			<div className="text-center py-2 px-3 w-full bg-primary-gray rounded-lg text-white">
				{query.full_query.split(" ").map((word, index) => {
					const key = `${word}-${index}`;
					if (query.collections.includes(word)) {
						return <WordSelector word={word} key={key} />;
					}
					return <React.Fragment key={key}>{` ${word} `}</React.Fragment>;
				})}
			</div>
			{typeof isHandled === "boolean" && (
				<div
					className={cn(
						"flex items-center gap-1.5 text-p rounded-lg py-1 px-3 border self-start",
						isHandled
							? "text-green border-green"
							: "text-red border-red"
					)}
					title={satisfactionLabel}
					aria-label={satisfactionLabel}
				>
					{isHandled ? (
						<Check className="size-4" aria-hidden="true" />
					) : (
						<X className="size-4" aria-hidden="true" />
					)}
					<span>{satisfactionLabel}</span>
				</div>
			)}
			<span className="text-p text-secondary-white">
				{t("other.involvedCollections")}
			</span>
			<div className="flex flex-wrap gap-2.5 w-full pr-3">
				{query.collections.map((collection) => (
					<div
						key={`${collection}-query`}
						className="text-secondary-white border border-gray text-p rounded-lg py-1 px-3 bg-terciary-gray"
					>
						{collection}
					</div>
				))}
			</div>

			{actionsSlot}
		</div>
	);
};
