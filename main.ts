import { Platform, Plugin, TFile, MarkdownView } from "obsidian";

export default class HtmlLocalSrcPlugin extends Plugin {
	private activeFile: TFile | null = null;
	onload() {
		this.registerMarkdownPostProcessor((element, ctx) => {
			this.processMarkdown(element, ctx);

		});

		this.registerMarkdownPostProcessor(this.modifyHTML.bind(this));
		this.registerEvent(this.app.workspace.on("file-open",this.show.bind(this)));
	}
	processMarkdown(element: HTMLElement, ctx: { sourcePath: string }){
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		const activeFile = activeView?.file;
		// console.log(element);
		if (activeFile) {
			// console.log(activeFile.basename)

			const targetLinks = Array.from(element.getElementsByTagName("img")).filter(
				(link) => {
					// console.log(link.src);
					return link.src.lastIndexOf(':') === 3;
				}
			);
			// console.log(targetLinks);
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
	}
	useProcessMarkdown(file:TFile){
		// 在 handleFileOpen 中调用 processMarkdown
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		const element = activeView?.contentEl as HTMLElement;
		const ctx = { sourcePath: file.path };
		this.processMarkdown(element, ctx);
	}
	handleFileOpen = async (file: TFile) => {
		// 当文件打开时，移除之前的 modify 事件监听器
		console.log('in handleFileOpen');
		this.useProcessMarkdown(file);
		if (this.activeFile) {
			this.app.vault.off("modify", this.handleFileModify);
		}

		// 记录当前活动文件
		this.activeFile = file;

		// 添加当前活动文件的 modify 事件监听器
		this.app.vault.on("modify", this.handleFileModify);
	};

	handleFileModify = async (file: TFile) => {
		console.log('in handleFileModify');
		if (this.activeFile && file.path === this.activeFile.path) {
			console.log(`Active file modified: ${file.path}`);
			this.useProcessMarkdown(file);
		}
	};
	modifyHTML(el: HTMLElement, ctx: { sourcePath: string }) {
		// Perform additional modifications to HTML if needed
		console.log("Markdown rendering completed:", ctx.sourcePath);
	}
	show(file:TFile){
		console.log('文件已打开',file.path);
		// const vault = JSON.parse(file.vault.);
		let attr = (file.vault as any).config.livePreview
		if(attr){
			// this.processMarkdown();
			console.log(attr);
			this.handleFileOpen(file);

		}
		console.log('end');
	}
}
