import { Plugin, MarkdownView, TFile } from 'obsidian';

export default class HtmlLocalSrcPlugin extends Plugin {
	private async processMarkdown(view: MarkdownView) {
		const activeFile = view.file;
		if (!activeFile) return;

		const targetLinks = Array.from(view.containerEl.querySelectorAll('img')).filter((link) => {
			const isRelativePath = !link.src.startsWith('http') && !link.src.startsWith('https');
			return isRelativePath && link.src.includes(activeFile.basename);
		});

		let activePath = this.app.vault.getResourcePath(activeFile);
		activePath = activePath.substring(0, activePath.lastIndexOf('/'));

		for (const link of targetLinks) {
			let cleanLink = link.src.replace('app://obsidian.md/', '');
			// For iOS
			cleanLink = cleanLink.replace('capacitor://localhost/', '');

			let fullLink = activePath + '/' + cleanLink;
			link.src = fullLink;

			// Add click event listener to trigger image preview
			link.addEventListener('click', (event) => this.triggerImagePreview(event, fullLink, activeFile));
		}

		// Use a Promise to delay the processing


	}

	private triggerImagePreview(event: MouseEvent, imageUrl: string, activeFile: TFile) {
		event.preventDefault(); // Prevent default behavior (opening the image)

		const activeLeaf = this.app.workspace.getActiveViewOfType(MarkdownView);
		// Trigger image preview
		this.app.workspace.trigger('image-preview:open', {
			src: imageUrl,
			activeLeaf: activeLeaf,
		});
	}

	onload() {
		this.registerEvent(this.app.workspace.on('file-open', this.onFileOpen.bind(this)));
		this.registerEvent(this.app.workspace.on('quick-preview', this.onEditorPreview.bind(this)));
		this.registerEvent(this.app.workspace.on('active-leaf-change', this.onEditorPreview.bind(this)));

	}

	async onFileOpen() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView instanceof MarkdownView) {
			await this.processMarkdown(activeView);
		}
	}

	async onEditorPreview(source: MarkdownView) {
		await this.processMarkdown(source);
	}
}
