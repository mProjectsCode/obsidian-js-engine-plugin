const TypeDoc = require('typedoc');

async function main() {
	const app = await TypeDoc.Application.bootstrapWithPlugins({
		entryPoints: ['jsEngine/api/*'],
		entryPointStrategy: 'expand',
	});

	// If you want TypeDoc to load tsconfig.json / typedoc.json files
	app.options.addReader(new TypeDoc.TSConfigReader());
	app.options.addReader(new TypeDoc.TypeDocReader());

	const project = await app.convert();

	if (project) {
		// Project may not have converted correctly
		const outputDir = 'docs';

		// Rendered docs
		await app.generateDocs(project, outputDir);
		// Alternatively generate JSON output
		//await app.generateJson(project, outputDir + "/documentation.json");
	}
}

main().catch(console.error);
