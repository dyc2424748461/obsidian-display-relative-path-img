import { Platform, Plugin, TFile, MarkdownView } from "obsidian";

export default class HtmlLocalSrcPlugin extends Plugin {
	onload() {
		this.registerMarkdownPostProcessor((element, ctx) => {
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			const activeFile = activeView?.file;
			// console.log(element);
			if (activeFile) {
				console.log(activeFile.basename)

				const targetLinks = Array.from(element.getElementsByTagName("img")).filter(
					(link) => {
						// console.log(link.src);
						return link.src.lastIndexOf(':') == 3;
					}
				);
				console.log(targetLinks);
				// console.log(activeFile);

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
