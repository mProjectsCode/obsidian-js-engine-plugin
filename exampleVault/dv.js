const indexNotes = dv.pages('"IndexNotes"');
const mainNotes = dv.pages('"MainNotes"');

console.log(indexNotes, mainNotes);

let error = '';

let mainNotesArr = mainNotes.map(x => ({
	splitFileName: x.file.name.split('-'),
	file: x.file,
}));

let mainNoteTree = {
	type: 'root',
	groups: {},
	children: {},
};

for (const mainNote of mainNotesArr) {
	if (mainNoteTree.groups[mainNote.splitFileName[0]] === undefined) {
		mainNoteTree.groups[mainNote.splitFileName[0]] = [mainNote];
	} else {
		mainNoteTree.groups[mainNote.splitFileName[0]].push(mainNote);
	}
}

for (const [key, value] of Object.entries(mainNoteTree.groups)) {
	value.sort((a, b) => a.splitFileName.length - b.splitFileName.length);

	let subtree = {
		type: 'subtree',
		file: undefined,
		fileName: key,
		fileNameParts: [],
		children: {},
	}

	for (const v of value) {
		// we skip the first note
		if (v.splitFileName.length === 1) {
			subtree.file = v.file;
			continue;
		}

		let parent = subtree;

		for (let i = 1; i < v.splitFileName.length - 1; i++) {
			parent = parent.children[v.splitFileName[i]];
		}

		parent.children[v.splitFileName[v.splitFileName.length - 1]] = {
			type: 'subtree',
			file: v.file,
			fileName: key,
			fileNameParts: v.splitFileName.splice(1),
			children: {},
		}
	}

	mainNoteTree.children[key] = subtree;
}

console.log(mainNoteTree);

const selectedFileName = "Plugins";

const selectedIndexNote = indexNotes.find(x => x.file.name === selectedFileName);

const selectedIndexNoteLinks = selectedIndexNote.file.link;


console.log(selectedIndexNoteLinks);





