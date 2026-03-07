function linkifyTextSegment(text: string): string {
	// Basic URL matching (supports http/https).
	// We intentionally keep this simple and avoid touching code blocks/inline code (handled by caller).
	const urlRegex = /\bhttps?:\/\/[^\s<>()]+/g;

	return text.replace(urlRegex, (url, offset, fullText) => {
		// Skip URLs that are already formatted as autolinks: <https://...>
		const prev = offset > 0 ? fullText[offset - 1] : '';
		const next = offset + url.length < fullText.length ? fullText[offset + url.length] : '';
		if (prev === '<' && next === '>') return url;

		// Trim trailing punctuation that should not be part of the URL.
		let trimmed = url;
		let trailing = '';
		while (trimmed.length > 0 && /[),.;:!?\\]]$/.test(trimmed)) {
			trailing = trimmed.slice(-1) + trailing;
			trimmed = trimmed.slice(0, -1);
		}
		if (!trimmed) return url;

		return `<${trimmed}>${trailing}`;
	});
}

function splitAndTransform(
	text: string,
	regex: RegExp,
	transformOutside: (segment: string) => string
): string {
	let out = '';
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	const r = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`);

	while ((match = r.exec(text)) !== null) {
		if (match.index > lastIndex) out += transformOutside(text.slice(lastIndex, match.index));
		out += match[0]; // keep matched segment untouched
		lastIndex = match.index + match[0].length;
	}
	if (lastIndex < text.length) out += transformOutside(text.slice(lastIndex));
	return out;
}

/**
 * Converts bare URLs into markdown autolinks (`<https://...>`) so renderers treat them as links.
 *
 * - Leaves fenced code blocks (``` ... ```) untouched.
 * - Leaves inline code (`...`) untouched.
 */
export function linkifyMarkdownUrls(markdown: string): string {
	// 1) Skip fenced code blocks entirely.
	const fencedCodeRegex = /```[\s\S]*?```/g;
	const outsideFences = (segment: string) => {
		// 2) Within non-fenced segments, skip inline code spans.
		const inlineCodeRegex = /`[^`]*`/g;
		return splitAndTransform(segment, inlineCodeRegex, linkifyTextSegment);
	};
	return splitAndTransform(markdown, fencedCodeRegex, outsideFences);
}

