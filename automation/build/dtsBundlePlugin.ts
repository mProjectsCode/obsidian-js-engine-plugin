import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

interface DtsBundlePluginResolvedOptions {
	rootDir: string;
	sourceDir: string;
	tempDir: string;
	outputFile: string;
	modulePrefix: string;
}

export interface DtsBundlePluginOptions {
	sourceDir: string;
	tempDir: string;
	outputFile: string;
	modulePrefix: string;
}

interface RewriteContext {
	modulePrefix: string;
	sourceDirPrefix: string;
}

const DECLARABLE_SYMBOL = '(?:abstract\\s+)?(?:class|function|const|let|var|enum|namespace|interface|type)';

function normalizePathLike(value: string): string {
	return value.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
}

function assertNonEmptyOption(name: keyof DtsBundlePluginOptions, value: string): void {
	if (value.trim().length === 0) {
		throw new Error(`[dts-bundle-plugin] Invalid option \"${name}\": value cannot be empty.`);
	}
}

function resolveOptions(rootDir: string, options: DtsBundlePluginOptions): DtsBundlePluginResolvedOptions {
	assertNonEmptyOption('sourceDir', options.sourceDir);
	assertNonEmptyOption('tempDir', options.tempDir);
	assertNonEmptyOption('outputFile', options.outputFile);
	assertNonEmptyOption('modulePrefix', options.modulePrefix);

	const sourceDir = normalizePathLike(options.sourceDir);
	const tempDir = normalizePathLike(options.tempDir);
	const outputFile = normalizePathLike(options.outputFile);
	const modulePrefix = normalizePathLike(options.modulePrefix);

	if (outputFile.endsWith('/')) {
		throw new Error('[dts-bundle-plugin] Invalid option "outputFile": expected a file path, got a directory.');
	}

	if (!outputFile.endsWith('.d.ts')) {
		throw new Error('[dts-bundle-plugin] Invalid option "outputFile": expected a .d.ts file path.');
	}

	if (tempDir === sourceDir || tempDir.startsWith(`${sourceDir}/`)) {
		throw new Error('[dts-bundle-plugin] Invalid option "tempDir": must be outside sourceDir.');
	}

	return {
		rootDir,
		sourceDir,
		tempDir,
		outputFile,
		modulePrefix,
	};
}

function normalizeSpecifier(specifier: string): string {
	return specifier
		.replace(/\\/g, '/')
		.replace(/\.d\.ts$/i, '')
		.replace(/\.(ts|tsx|mts|cts)$/i, '');
}

function resolveModuleSpecifier(currentModuleId: string, specifier: string, context: RewriteContext): string {
	if (specifier.startsWith('.')) {
		const currentDir = path.posix.dirname(currentModuleId);
		return normalizeSpecifier(path.posix.normalize(path.posix.join(currentDir, specifier)));
	}

	if (specifier.startsWith(`${context.sourceDirPrefix}/`)) {
		return normalizeSpecifier(specifier.replace(new RegExp(`^${context.sourceDirPrefix}/`), `${context.modulePrefix}/`));
	}

	if (specifier.startsWith('src/')) {
		return normalizeSpecifier(`${context.modulePrefix}/${specifier.slice(4)}`);
	}

	return specifier;
}

function rewriteSpecifiers(content: string, currentModuleId: string, context: RewriteContext): string {
	const fromRegex = /(from\s+['"])([^'"]+)(['"])/g;
	const importTypeRegex = /(import\(['"])([^'"]+)(['"]\))/g;
	const exportFromRegex = /(export\s+\*\s+from\s+['"])([^'"]+)(['"])/g;
	const sideEffectImportRegex = /(import\s+['"])([^'"]+)(['"]\s*;?)/g;

	let rewritten = content
		.replace(fromRegex, (_match, p1: string, specifier: string, p3: string) => {
			const nextSpecifier = resolveModuleSpecifier(currentModuleId, specifier, context);
			return `${p1}${nextSpecifier}${p3}`;
		})
		.replace(importTypeRegex, (_match, p1: string, specifier: string, p3: string) => {
			const nextSpecifier = resolveModuleSpecifier(currentModuleId, specifier, context);
			return `${p1}${nextSpecifier}${p3}`;
		})
		.replace(exportFromRegex, (_match, p1: string, specifier: string, p3: string) => {
			const nextSpecifier = resolveModuleSpecifier(currentModuleId, specifier, context);
			return `${p1}${nextSpecifier}${p3}`;
		})
		.replace(sideEffectImportRegex, (_match, p1: string, specifier: string, p3: string) => {
			const nextSpecifier = resolveModuleSpecifier(currentModuleId, specifier, context);
			return `${p1}${nextSpecifier}${p3}`;
		});

	// Do not carry style side-effect imports into declaration bundles.
	rewritten = rewritten.replace(/^\s*import\s+['"][^'"]+\.css['"];?\s*$/gm, '');

	// TSC often emits this for module files with only types; it's unnecessary in ambient module wrappers.
	rewritten = rewritten.replace(/^\s*export\s*\{\s*\};?\s*$/gm, '');

	// Module bodies are already ambient because we wrap each one in `declare module`.
	// Strip nested `declare` modifiers to avoid TS1038.
	rewritten = rewritten
		.replace(new RegExp(`^(\\s*export\\s+)declare(\\s+${DECLARABLE_SYMBOL}\\b)`, 'gm'), '$1$2')
		.replace(new RegExp(`^(\\s*)declare(\\s+${DECLARABLE_SYMBOL}\\b)`, 'gm'), '$1$2');

	return rewritten.trimEnd();
}

async function collectDtsFiles(dir: string): Promise<string[]> {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	const files: string[] = [];

	for (const entry of entries) {
		const absPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await collectDtsFiles(absPath)));
			continue;
		}

		if (entry.isFile() && entry.name.endsWith('.d.ts')) {
			files.push(absPath);
		}
	}

	return files;
}

async function runTsc(projectPath: string, cwd: string): Promise<void> {
	const tscJsPath = path.resolve(cwd, 'node_modules/typescript/lib/tsc.js');

	await fs.access(tscJsPath);

	await new Promise<void>((resolve, reject) => {
		const child = spawn(process.execPath, [tscJsPath, '--project', projectPath], {
			cwd,
			stdio: 'inherit',
		});

		child.on('error', reject);
		child.on('close', code => {
			if (code === 0) {
				resolve();
				return;
			}

			reject(new Error(`tsc exited with code ${code}`));
		});
	});
}

async function bundleTypes(options: DtsBundlePluginResolvedOptions): Promise<void> {
	const tempTsConfigPath = path.join(options.rootDir, `.tsconfig.types.generated.${process.pid}.json`);
	const sourceTsGlob = `${options.sourceDir.replace(/\\/g, '/')}/**/*.ts`;
	const sourceDtsGlob = `${options.sourceDir.replace(/\\/g, '/')}/**/*.d.ts`;
	const tempOutDir = path.join(options.rootDir, options.tempDir);
	const outputFilePath = path.join(options.rootDir, options.outputFile);
	const sourceDirPath = path.join(options.rootDir, options.sourceDir);
	const rewriteContext: RewriteContext = {
		modulePrefix: options.modulePrefix,
		sourceDirPrefix: options.sourceDir,
	};

	await fs.access(sourceDirPath);

	const tempTsConfig = {
		extends: './tsconfig.json',
		compilerOptions: {
			declaration: true,
			emitDeclarationOnly: true,
			declarationMap: false,
			stripInternal: true,
			rootDir: options.sourceDir,
			outDir: options.tempDir,
		},
		include: [sourceTsGlob, sourceDtsGlob],
		exclude: ['**/*.test.ts', '**/*.spec.ts'],
	};

	await fs.rm(tempOutDir, { recursive: true, force: true });
	await fs.writeFile(tempTsConfigPath, `${JSON.stringify(tempTsConfig, null, 2)}\n`, 'utf8');

	try {
		await runTsc(tempTsConfigPath, options.rootDir);

		const files = (await collectDtsFiles(tempOutDir)).filter(file => !file.endsWith('.d.ts.map')).sort((a, b) => a.localeCompare(b));

		const moduleBlocks: string[] = [];

		for (const file of files) {
			const relativeFromSource = normalizeSpecifier(path.posix.normalize(path.relative(tempOutDir, file).replace(/\\/g, '/')));
			if (!relativeFromSource || relativeFromSource.startsWith('..')) {
				continue;
			}

			const moduleId = `${options.modulePrefix}/${relativeFromSource}`;
			const content = await fs.readFile(file, 'utf8');
			const rewritten = rewriteSpecifiers(content, moduleId, rewriteContext);
			if (!rewritten.trim()) {
				continue;
			}

			const indentedBody = rewritten
				.split('\n')
				.map(line => (line.length > 0 ? `  ${line}` : line))
				.join('\n');

			moduleBlocks.push(`declare module \"${moduleId}\" {\n${indentedBody}\n}`);
		}

		if (moduleBlocks.length === 0) {
			throw new Error('No declaration files were generated for bundling.');
		}

		moduleBlocks.push(`declare module \"${options.modulePrefix}\" {\n  export * from \"${options.modulePrefix}/index\";\n}`);

		let bundledContent = `${moduleBlocks.join('\n\n')}\n`;

		// Final safeguard normalization for any specifier that escaped per-module rewrites.
		bundledContent = bundledContent
			.replace(new RegExp(`(["'])${options.sourceDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`, 'g'), `$1${options.modulePrefix}/`)
			.replace(/^\s*import\s+['"][^'"]+\.css['"];?\s*$/gm, '');

		await fs.mkdir(path.dirname(outputFilePath), { recursive: true });

		await fs.writeFile(outputFilePath, bundledContent, 'utf8');
	} finally {
		await fs.rm(tempTsConfigPath, { force: true });
		await fs.rm(tempOutDir, { recursive: true, force: true });
	}
}

export function dtsBundlePlugin(options: DtsBundlePluginOptions): Plugin {
	let rootDir = '';

	return {
		name: 'dts-bundle-plugin',
		apply: 'build',
		configResolved(config) {
			rootDir = config.root;
		},
		async closeBundle() {
			const resolvedOptions = resolveOptions(rootDir, options);
			await bundleTypes(resolvedOptions);
		},
	};
}
