	<script lang="ts">
	import {
		PromptInput,
		PromptInputBody,
		PromptInputTextarea,
		PromptInputToolbar,
		PromptInputTools,
		PromptInputSubmit,
		type ChatStatus,
		type PromptInputMessage
	} from '$lib/components/ai-elements/prompt-input/index';
	import {
		Message,
		MessageActions,
		MessageContent,
		MessageResponse
	} from '$lib/components/ai-elements/new-message/index';
	import { CopyButton } from '$lib/components/ui/copy-button/index';
	import type { Snippet } from 'svelte';

	type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string; timestamp: Date; id?: string };

	type Props = {
		reportId: string;
		title?: string;
		subtitle?: string;
		backHref?: string;
		secondaryHref?: string;
		secondaryLabel?: string;
		onSendMessage: (message: string) => Promise<void>;
		messages?: ChatMessage[];
		isLoading?: boolean;
		showHeader?: boolean;
		displayId?: string;
		topPanel?: Snippet;
		headerActions?: Snippet;
		messageContent?: Snippet<[ChatMessage, number]>;
		loadingContent?: Snippet;
		inputButtons?: Snippet;
		composerFooter?: Snippet;
	};

	let props: Props = $props();
	let title = $derived(props.title ?? 'Chat');
	let subtitle = $derived(props.subtitle ?? '');
	let backHref = $derived(props.backHref ?? '');
	let secondaryHref = $derived(props.secondaryHref ?? '');
	let secondaryLabel = $derived(props.secondaryLabel ?? '');
	let onSendMessage = $derived(props.onSendMessage);
	let messages = $derived(props.messages ?? []);
	let isLoading = $derived(props.isLoading ?? false);
	let showHeader = $derived(props.showHeader ?? true);
	let displayId = $derived(props.displayId ?? props.reportId);
	let topPanel = $derived(props.topPanel);
	let headerActions = $derived(props.headerActions);
	let messageContent = $derived(props.messageContent);
	let loadingContent = $derived(props.loadingContent);
	let inputButtons = $derived(props.inputButtons);
	let composerFooter = $derived(props.composerFooter);

	let text = $state('');
	let status = $derived<ChatStatus>(isLoading ? 'streaming' : 'idle');
	let messageCount = $derived(messages.length);
	let scrollRef = $state<HTMLElement | null>(null);

	$effect(() => {
		void messageCount;
		void isLoading;
		if (!scrollRef) return;
		requestAnimationFrame(() => {
			if (!scrollRef) return;
			scrollRef.scrollTop = scrollRef.scrollHeight;
		});
	});

	async function handleSubmit(message: PromptInputMessage) {
		const submittedText = (message.text ?? '').trim();
		if (!submittedText) return;
		await onSendMessage(submittedText);
		text = '';
	}
</script>

<div class="flex h-full min-w-0 flex-col bg-background">
	{#if showHeader}
		<header class="flex h-12 shrink-0 items-center justify-between border-b px-4">
			<div class="min-w-0">
				<div class="flex min-w-0 items-center gap-2">
					<h1 class="truncate text-sm font-medium">{title}</h1>
					{#if subtitle}
						<span class="shrink-0 text-xs text-muted-foreground">{subtitle}</span>
					{/if}
					<code class="truncate rounded bg-muted px-1.5 py-0.5 text-xs">{displayId}</code>
				</div>
			</div>

			<div class="flex shrink-0 items-center gap-2">
				{@render headerActions?.()}
				{#if backHref}
					<a
						href={backHref}
						class="rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
					>
						Back
					</a>
				{/if}
				{#if secondaryHref && secondaryLabel}
					<a
						href={secondaryHref}
						class="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90"
					>
						{secondaryLabel}
					</a>
				{/if}
			</div>
		</header>
	{/if}

	{@render topPanel?.()}

	<main class="min-h-0 flex-1 overflow-y-auto" bind:this={scrollRef}>
		<div class="mx-auto max-w-[900px] p-4">
			{#if messages.length === 0}
				<div class="flex h-full items-center justify-center py-20 text-muted-foreground">
					<p>Ask a question to start.</p>
				</div>
			{:else}
				<div class="flex flex-col gap-4">
					{#each messages as message, index (message.id ?? `fallback-${index}`)}
						<Message from={message.role === 'user' ? 'user' : 'assistant'}>
							<MessageContent>
								{#if message.role === 'user'}
									{message.content}
								{:else}
									<MessageResponse content={message.content} />
								{/if}
							</MessageContent>

							{#if message.role !== 'user'}
								<MessageActions>
									<CopyButton text={message.content} size="sm" variant="ghost" />
								</MessageActions>
							{/if}
						</Message>

						{@render messageContent?.(message, index)}
					{/each}

					{@render loadingContent?.()}
				</div>
			{/if}
		</div>
	</main>

	<footer class="shrink-0 border-t bg-muted/30 p-4">
		<div class="mx-auto max-w-[900px]">
			<PromptInput disableAttachments onSubmit={handleSubmit}>
				<PromptInputBody>
					<PromptInputTextarea
						bind:value={text}
						disableAttachments
						placeholder="Ask about this report…"
						disabled={isLoading}
						class="placeholder:!text-gray-400"
					/>
				</PromptInputBody>
				<PromptInputToolbar>
					<PromptInputTools>
						{@render composerFooter?.()}
					</PromptInputTools>
					{@render inputButtons?.()}
					<PromptInputSubmit {status} disabled={isLoading} />
				</PromptInputToolbar>
			</PromptInput>
		</div>
	</footer>
</div>
