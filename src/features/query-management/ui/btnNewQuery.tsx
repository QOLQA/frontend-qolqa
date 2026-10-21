"use client";

import { useState } from "react";
import { ModalNewQuery } from "./modalNewQuery";

export const BtnNewQuery = () => {
	const [open, setOpen] = useState(false);
	const [queryText, setQueryText] = useState("");

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="w-full h-auto py-4 flex justify-center rounded-xl items-center border-2 border-dashed border-gray bg-transparent text-semilighter-gray"
			>
				<div className="py-1.5 px-5 border border-gray bg-transparent rounded-lg text-h5 hover:bg-primary-gray hover:text-white cursor-pointer transition-all duration-500">
					Add Query
				</div>
			</button>

			<ModalNewQuery
				open={open}
				setOpen={setOpen}
				mode="create"
				queryText={queryText}
				setQueryText={setQueryText}
			/>
		</>
	);
};
