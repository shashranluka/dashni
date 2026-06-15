export const arrangeWords = (
	words = [],
	learnedWordIds = [],
	needsWordIds = [],
) => {
	const learnedSet = new Set(learnedWordIds || []);
	const needsSet = new Set(needsWordIds || []);

	const learned = [];
	const needs = [];
	const fresh = [];

	for (const word of words || []) {
		const id = word?.id;

		if (learnedSet.has(id)) {
			learned.push(word);
		} else if (needsSet.has(id)) {
			needs.push(word);
		} else {
			fresh.push(word);
		}
	}

	return { learned, needs, fresh };
};

export const getWordsForFilter = (arranged, filter, allWords = []) => {
	if (filter === "learned") return arranged.learned;
	if (filter === "needs") return arranged.needs;
	if (filter === "new") return arranged.fresh;
	return allWords;
};
