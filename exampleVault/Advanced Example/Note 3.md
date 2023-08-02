---
number: 3
added:
  - Quest 5
removed:
  - Quest 4
aliases: []
---

# Added

```meta-bind
INPUT[list:added]
```

# Removed

```meta-bind
INPUT[list:removed]
```

# Total

```js-engine
const dv = engine.getPlugin('dataview').api;

const pages = dv.pages().filter(x => x.file.name.startsWith('Note')).filter(x => x.number <= context.metadata.frontmatter.number);

let quests = [];

for (const page of pages) {
	for (const a_quest of page.added) {
		quests.push({
			name: a_quest,
			added: page.number,
			removed: -1,
		});
	}
}

for (const page of pages) {
	for (const r_quest of page.removed) {
		for (const quest of quests) {
			if (quest.name === r_quest && quest.added <= page.number) {
				quest.removed = page.number;
			}
		}
	}
}

const mdBuilder = engine.markdown.createBuilder();

mdBuilder.createTable(
	["Quest", "Completed", "Started On", "Completed On"],
	quests.map(x => [
		x.name,
		x.removed !== -1 ? "[x]" : "[ ]",
		x.added,
		x.removed !== -1 ? x.removed : "", 
	])
);

return mdBuilder;
```