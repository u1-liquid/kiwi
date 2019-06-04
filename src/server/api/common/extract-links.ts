import { resolvePath } from './resolve-path';

export function extractLinks(pagePath: string, ast: any[]): string[] {
	const links: string[] = [];

	function x(tokens: any[]) {
		for (const token of tokens) {
			if (token.type === 'link') {
				const url = token.url;
				try {
					const link = resolvePath(url, pagePath);
					if ((link !== pagePath) && !links.includes(link)) links.push(link);
				} catch (e) {}
			}
			if (token.children) {
				x(token.children);
			}
		}
	}

	x(ast);

	return links.filter(x => x != null);
}
