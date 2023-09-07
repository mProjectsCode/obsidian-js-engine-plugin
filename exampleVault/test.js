// Step 1: Get Prompts
const title = await tp.system.prompt("Enter Site Name");
const parentLocation = await tp.system.prompt("Enter Parent Location");

const parentFile = app.vault.getAbstractFileByPath("3. Gazetteer/1. Settlements/" + parentLocation + "/" + parentLocation + ".md");
const parentFileCache = await app.metadataCache.getFileCache(parentFile);

// Step 2: Change Frontmatter
await app.fileManager.processFrontMatter(tp.config.target_file, (frontmatter) => { 
	frontmatter.Location = parentLocation; 
	frontmatter.LocationHex = parentFileCache.LocationHex;
});


// Step 3: Move and Rename
await tp.file.move("3. Gazetteer/1. Settlements/" + parentLocation + "/" + title);

