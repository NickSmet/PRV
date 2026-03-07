function hasInspectionEscapes(value: unknown): boolean {
	if (typeof value === 'string') {
		return (
			value.includes('\n') ||
			value.includes('\\n') ||
			value.includes('\\r\\n') ||
			value.includes('\\"')
		);
	}
	if (!value || typeof value !== 'object') return false;

	if (Array.isArray(value)) return value.some(hasInspectionEscapes);
	return Object.values(value as Record<string, unknown>).some(hasInspectionEscapes);
}

function unescapeNewlines(text: string): string {
	if (text.includes('\n')) return text;
	return text.replaceAll('\\r\\n', '\n').replaceAll('\\n', '\n');
}

function unescapeQuotes(text: string): string {
	return text.replaceAll('\\"', '"');
}

function escapeTemplateLiteral(text: string): string {
	return text.replaceAll('`', '\\`').replaceAll('${', '\\${');
}

function indentLines(text: string, indent: string): string {
	// Preserve empty lines; indent every line.
	return text
		.split('\n')
		.map((line) => indent + line)
		.join('\n');
}

function formatValue(value: unknown, indentLevel: number): string {
	const indent = '  '.repeat(indentLevel);
	const nextIndent = '  '.repeat(indentLevel + 1);

	if (value === null) return 'null';
	if (value === undefined) return 'undefined';
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);

	if (typeof value === 'string') {
		const rawHadEscapes = value.includes('\\n') || value.includes('\\r\\n') || value.includes('\\"');
		const normalized = unescapeQuotes(unescapeNewlines(value));

		// Prefer template literals for inspection when the original string was escape-heavy
		// (newlines or escaped quotes), so it's readable at a glance.
		if (rawHadEscapes || normalized.includes('\n')) {
			const escaped = escapeTemplateLiteral(normalized);

			if (escaped.includes('\n')) {
				const indented = indentLines(escaped, nextIndent);
				return `\`\n${indented}\n${indent}\``;
			}

			return `\`${escaped}\``;
		}

		return JSON.stringify(normalized);
	}

	if (Array.isArray(value)) {
		if (value.length === 0) return '[]';
		const items = value.map((v) => `${nextIndent}${formatValue(v, indentLevel + 1)}`).join(',\n');
		return `[\n${items}\n${indent}]`;
	}

	if (typeof value === 'object') {
		const entries = Object.entries(value as Record<string, unknown>);
		if (entries.length === 0) return '{}';
		const body = entries
			.map(([key, v]) => `${nextIndent}${JSON.stringify(key)}: ${formatValue(v, indentLevel + 1)}`)
			.join(',\n');
		return `{\n${body}\n${indent}}`;
	}

	return JSON.stringify(String(value));
}

export function formatForInspection(value: unknown): string {
	return formatValue(value, 0);
}

export function shouldUseInspectionFormat(value: unknown): boolean {
	return hasInspectionEscapes(value);
}
