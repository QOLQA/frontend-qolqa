import { useState, useEffect, useRef } from "react";

function computeHighlightedWords(words: string[], tables: string[]): string[] {
	const matchedWords: string[] = [];
	words.forEach((word) => {
		const wordPrefix = word.toLowerCase().slice(0, 3);
		if (tables.some((t) => t.toLowerCase().slice(0, 3) === wordPrefix)) {
			matchedWords.push(word);
		}
	});
	return matchedWords;
}

function autoSelectTables(
	words: string[],
	tableNames: string[]
): { tables: string[]; matchedWords: string[] } {
	const selectedTables = new Set<string>();
	const selectedWords = new Set<string>();

	words.forEach((word) => {
		const wordPrefix = word.toLowerCase().slice(0, 3);

		tableNames.forEach((tableName) => {
			const tablePrefix = tableName.toLowerCase().slice(0, 3);
			if (wordPrefix === tablePrefix) {
				selectedTables.add(tableName);
				selectedWords.add(word);
			}
		});
	});

	return {
		tables: Array.from(selectedTables),
		matchedWords: Array.from(selectedWords),
	};
}

export function useTableSelection(
	queryText: string,
	availableTableNames: string[],
	isOpen: boolean,
	initialTables?: string[]
) {
	const [selectedTables, setSelectedTables] = useState<string[]>([]);
	const [highlightedWords, setHighlightedWords] = useState<string[]>([]);
	const [error, setError] = useState(false);
	const words = queryText.trim().split(/\s+/);

	// Guards seeding so selection is initialized only once per modal open.
	// Manual add/remove afterwards is driven by the exposed handlers and is
	// never re-seeded by this effect, even if the deps change while open.
	const seededRef = useRef(false);

	useEffect(() => {
		if (!isOpen) {
			seededRef.current = false;
			return;
		}

		if (seededRef.current) {
			return;
		}
		seededRef.current = true;

		if (queryText.trim()) {
			const seedWords = queryText.trim().split(/\s+/);
			if (initialTables) {
				setSelectedTables(initialTables);
				setHighlightedWords(
					computeHighlightedWords(seedWords, initialTables)
				);
			} else {
				const { tables: autoTables, matchedWords } = autoSelectTables(
					seedWords,
					availableTableNames
				);
				setSelectedTables(autoTables);
				setHighlightedWords(matchedWords);
			}
		}
	}, [isOpen, queryText, availableTableNames, initialTables]);

	const addTable = (tableName: string) => {
		if (!selectedTables.includes(tableName)) {
			setSelectedTables((prev) => [...prev, tableName]);

			const matchingWord = words.find(
				(word) =>
					word.toLowerCase().slice(0, 3) ===
					tableName.toLowerCase().slice(0, 3)
			);

			if (matchingWord && !highlightedWords.includes(matchingWord)) {
				setHighlightedWords((prev) => [...prev, matchingWord]);
			}
		}
		setError(false);
	};

	const removeTable = (tableName: string) => {
		setSelectedTables((prev) => prev.filter((t) => t !== tableName));

		const matchingWord = words.find(
			(word) =>
				word.toLowerCase().slice(0, 3) ===
				tableName.toLowerCase().slice(0, 3)
		);

		if (matchingWord) {
			setHighlightedWords((prev) => prev.filter((w) => w !== matchingWord));
		}
	};

	const toggleWord = (word: string) => {
		const wordPrefix = word.toLowerCase().slice(0, 3);
		const matchingTable = availableTableNames.find(
			(tableName) => tableName.toLowerCase().slice(0, 3) === wordPrefix
		);

		if (matchingTable) {
			if (selectedTables.includes(matchingTable)) {
				removeTable(matchingTable);
			} else {
				addTable(matchingTable);
			}
		}
		setError(false);
	};

	const clearSelection = () => {
		setSelectedTables([]);
		setHighlightedWords([]);
		setError(false);
	};

	const validateSelection = (): boolean => {
		if (selectedTables.length === 0) {
			setError(true);
			return false;
		}
		setError(false);
		return true;
	};

	return {
		selectedTables,
		highlightedWords,
		error,
		words,
		addTable,
		removeTable,
		toggleWord,
		clearSelection,
		validateSelection,
	};
}
