import {Platform, Plugin, TFile, MarkdownView, editorLivePreviewField} from "obsidian";

export  default class HtmlLocalSrcPlugin extends Plugin {
	private activeFile: TFile | null = null;
	private enableLog = false;
	private log = this.enableLog?console.log:()=>{};

	onload() {
		this.app.workspace.getActiveViewOfType(MarkdownView);
		this.registerMarkdownPostProcessor((element, ctx) => {
			this.processMarkdown(element);

		});

		this.registerMarkdownPostProcessor(this.modifyHTML.bind(this));
		this.registerEvent(this.app.workspace.on("file-open", this.processView.bind(this)));
	}

	processMarkdown(element: HTMLElement) {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		const activeFile = activeView?.file;
		// this.log(element);
		if (activeFile) {
			// this.log(activeFile.basename)

			const targetLinks = Array.from(element.getElementsByTagName("img")).filter(
				(link) => {
					this.log('live', editorLivePreviewField, 'live');
					return link.src.lastIndexOf(':') === 3;//"app://...."
				}
			);
			// this.log(targetLinks);
			// this.log(activeFile);

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

	useProcessMarkdown(file: TFile) {

		// 在 handleFileOpen 中调用 processMarkdown
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		this.log('activeView  ',activeView);
		const element = activeView?.contentEl as HTMLElement;
		const ctx = {sourcePath: file.path};
		this.processMarkdown(element);
	}

	handleFileOpen = async (file: TFile) => {
		// 当文件打开时，移除之前的 modify 事件监听器
		this.log('in handleFileOpen');
		this.useProcessMarkdown(file);
		if (this.activeFile) {
			this.app.vault.off("modify", this.handleFileModify);
		}

		// 记录当前活动文件
		this.activeFile = file;

		// 添加当前活动文件的 modify 事件监听器
		this.registerEvent(this.app.vault.on("modify", this.handleFileModify));
	};

	handleFileModify = async (file: TFile) => {
		this.log('in handleFileModify');
		if (this.activeFile && file.path === this.activeFile.path) {
			this.log(`Active file modified: ${file.path}`);
			this.useProcessMarkdown(file);
		}
	};

	modifyHTML(el: HTMLElement, ctx: { sourcePath: string }) {
		// Perform additional modifications to HTML if needed
		this.log("Markdown rendering completed:", ctx.sourcePath);
	}

	/*
	scroll部分子函数
	 */

	scrollLines = async (element: HTMLElement): Promise<number> => {

		// 获取一个元素，你可以根据你的需要选择合适的选择器
// 使用 as 类型断言，告诉编译器 element 是一个 HTMLElement 类型的对象
// 		let element = document.querySelector('.cm-scroller') as HTMLElement;

// 获取元素的边界矩形
		let rect = element.getBoundingClientRect();

// 获取元素的高度，可见高度，内容高度，滚动距离 总长度
// 使用 const 声明常量，并添加类型注解
		const height: number = rect.height;
		const clientHeight: number = Math.round(element.clientHeight);
		// const scrollHeight: number = element.scrollHeight;
		const scrollTop: number = Math.round(element.scrollTop);
		const scrollHeight:number = element.scrollHeight
		// element.

// 计算元素的每一行的高度，假设每一行的高度是相同的
// 使用 const 声明常量，并添加类型注解
		const lineHeight: number = height / clientHeight;

// 计算元素的总行数，假设每一行的内容是相同的
// 使用 const 声明常量，并添加类型注解
// 		const totalLines: number = scrollHeight / lineHeight ;

// 计算元素的滚动行数，也就是滚动了多少行
// 使用 const 声明常量，并添加类型注解
		const scrollLines: number = Math.round(scrollTop / lineHeight);
		this.log('scrollHeight ',scrollTop%clientHeight -clientHeight/4 <0)
		if (scrollTop%clientHeight -clientHeight/4 <0){
			this.log('in Scroll');
			this.useProcessMarkdown(this.activeFile as TFile)
		}


// 在控制台打印出滚动行数
		this.log('You scrollTop ' + scrollTop+'  ,Height ='+clientHeight + ', clientHeight ' + clientHeight + ' lines.');
		return scrollLines;
	};


	scroll_toUpdateView(activeView:MarkdownView) {
		let div = activeView?.containerEl.querySelector('.cm-scroller');
		this.log(div)
		// @ts-ignore
		div.getBoundingClientRect();
// this.registerDomEvent()

		// @ts-ignore
		this.registerDomEvent(div, 'scroll', (event) => {
			this.scrollLines(div as HTMLElement);
			// 在控制台打印出滚动的距离
			this.log('Editor Scrolled:   pixels vertically and pixels horizontally.');
		});
	}

	/*
	主要函数
	 */
	processView() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		const file = activeView?.file;
		this.log(activeView?.file);
		if (file==null) return;
		this.log('文件已打开', file.path);
		// const vault = JSON.parse(file.vault.);
		const config = (file.vault as any).config;
		let attr = config.livePreview;
		const defaultView = config.defaultViewMode;
		this.log(file);
		if (attr || defaultView === 'preview') {
			// this.processMarkdown();
			this.log(attr);
			this.handleFileOpen(file);
			this.scroll_toUpdateView(activeView as MarkdownView);

		}
		this.log('end');
	}
}
