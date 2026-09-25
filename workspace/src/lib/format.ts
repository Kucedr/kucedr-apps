export const formattableExtensions = new Set([
	'css', 'graphql', 'gql', 'htm', 'html', 'js', 'jsx', 'json', 'json5', 'jsonc',
	'less', 'md', 'mdx', 'mjs', 'cjs', 'mts', 'cts', 'py', 'pyi', 'scss', 'ts', 'tsx',
	'vue', 'yaml', 'yml',
]);

export async function formatFile(path: string, content: string): Promise<string> {
	const extension = path.split('.').pop()?.toLowerCase();
	if (extension === 'py' || extension === 'pyi') {
		const { default: init, PositionEncoding, Workspace } = await import('@astral-sh/ruff-wasm-web');
		await init();
		const workspace = new Workspace({}, PositionEncoding.Utf16);
		try {
			return workspace.format(content);
		} finally {
			workspace.free();
		}
	}

	const prettier = await import('prettier/standalone');
	switch (extension) {
		case 'js':
		case 'jsx':
		case 'mjs':
		case 'cjs':
			return prettier.format(content, {
				filepath: path,
				parser: 'babel',
				plugins: [await import('prettier/plugins/babel'), await import('prettier/plugins/estree')],
			});
		case 'ts':
		case 'tsx':
		case 'mts':
		case 'cts':
			return prettier.format(content, {
				filepath: path,
				parser: 'typescript',
				plugins: [await import('prettier/plugins/typescript'), await import('prettier/plugins/estree')],
			});
		case 'json':
		case 'jsonc':
		case 'json5':
			return prettier.format(content, {
				filepath: path,
				parser: extension,
				plugins: [await import('prettier/plugins/babel'), await import('prettier/plugins/estree')],
			});
		case 'css':
		case 'scss':
		case 'less':
			return prettier.format(content, {
				filepath: path,
				parser: extension,
				plugins: [await import('prettier/plugins/postcss')],
			});
		case 'htm':
		case 'html':
		case 'vue':
			return prettier.format(content, {
				filepath: path,
				parser: extension === 'vue' ? 'vue' : 'html',
				plugins: [await import('prettier/plugins/html')],
			});
		case 'md':
		case 'mdx':
			return prettier.format(content, {
				filepath: path,
				parser: extension === 'mdx' ? 'mdx' : 'markdown',
				plugins: [await import('prettier/plugins/markdown')],
			});
		case 'yaml':
		case 'yml':
			return prettier.format(content, {
				filepath: path,
				parser: 'yaml',
				plugins: [await import('prettier/plugins/yaml')],
			});
		case 'graphql':
		case 'gql':
			return prettier.format(content, {
				filepath: path,
				parser: 'graphql',
				plugins: [await import('prettier/plugins/graphql')],
			});
		default:
			throw new Error('Formatting is not available for this file type.');
	}
}
