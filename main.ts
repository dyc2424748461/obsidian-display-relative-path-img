import { Platform, Plugin, TFile, MarkdownView } from "obsidian";

export default class HtmlLocalSrcPlugin extends Plugin {
	onload() {
		this.registerMarkdownPostProcessor((element, ctx) => {
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			const activeFile = activeView?.file;

			if (activeFile) {
				const targetLinks = Array.from(element.getElementsByTagName("img")).filter(
					(link) => link.src.includes(activeFile.basename)
				);

				let activePath = this.app.vault.getResourcePath(activeFile);
				activePath = activePath ? activePath.substring(0, activePath.lastIndexOf("/")) : '';

				for (const link of targetLinks) {
					let cleanLink = link.src.replace('app://obsidian.md/', '');
					// For iOS
					cleanLink = cleanLink.replace('capacitor://localhost/', '');

					let fullLink = activePath + '/' + cleanLink;
					link.src = fullLink;

					if (Platform.isMobile) {
						// Modify styling for mobile platform
						link.style.objectFit = "contain";
						link.style.height = "100px";
					}
				}
			}
		});

		this.registerMarkdownPostProcessor(this.modifyHTML.bind(this));
	}

	modifyHTML(el: HTMLElement, ctx: { sourcePath: string }) {
		// Perform additional modifications to HTML if needed
		console.log("Markdown rendering completed:", ctx.sourcePath);
	}
}
