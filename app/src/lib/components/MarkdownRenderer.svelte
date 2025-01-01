<script lang="ts">
	import { cn, extractCleanDomain } from '@/utils';
	import showdown from 'showdown';
	import type { ClassValue } from 'tailwind-variants';

	export let content: string = '';
	export let contentClass: ClassValue = '';

	// Initialize the Showdown converter with custom options
	const converter = new showdown.Converter({
		extensions: [
			{
				type: 'lang',
				regex: /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
				replace: function (match: string, text: string, url: string) {
					const domain = extractCleanDomain(url);
					return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
				}
			}
		]
	});

	// Process content:
	// 1. First handle our custom [text] to <em> conversion
	// 2. Then let showdown handle the markdown with our custom link extension
	$: processedContent = content
		?.replace(/(?<!\[.*?)\[([\s\S]*?)\](?!\()/g, '<em>$2</em>') // Replace [text] with <em>text</em> only if not followed by (url)
		.replace(/\\/g, ''); // Remove escaped backslashes

	$: convertedContent = converter.makeHtml(processedContent || '');
</script>

<div
	class={cn(
		'markdown-content font-roboto text-white-200 text-[14px] font-light [&>p>-a]:text-white-100 [&p>em]:text-nowrap',
		contentClass
	)}
>
	{@html convertedContent}
</div>

<style lang="postcss">
	.markdown-content {
		& > p > a {
			color: #fff;
			text-decoration: underline;
			margin-left: 2px;
		}

		& > blockquote > p > a {
			color: #fff;
			text-decoration: underline;
			margin-left: 2px;
		}

		& > p > em {
			font-style: italic;
			color: #fff;
			font-weight: 300;
			margin-right: 2px;
		}
	}
</style>
