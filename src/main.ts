import {editorLivePreviewField, MarkdownView, Plugin,} from "obsidian";

export default class HtmlLocalSrcPlugin extends Plugin {
	private enableLog = false;
	private log = this.enableLog ? console.log : () => {
	};

	onload() {
		this.registerMarkdownPostProcessor((element, ctx) => {
			this.processMarkdown(element);
		});
		this.processView();//init current view
		this.registerMarkdownPostProcessor(this.modifyHTML.bind(this));
		this.registerEvent(this.app.workspace.on("file-open", this.processView.bind(this)));
		this.registerEvent(this.app.workspace.on("editor-change",this.useProcessMarkdown.bind(this)));
	}
	/*
	主要函数
	 */
	processView() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		const file = activeView?.file;
		if (file == null) return;
		this.log('文件已打开', file.path);
		this.useProcessMarkdown();
		if (activeView instanceof MarkdownView) {
			this.scroll_toUpdateView(activeView);
		}
		this.log(editorLivePreviewField)
		this.log('end');
	}
	processMarkdown(element: HTMLElement) {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		const activeFile = activeView?.file;
		// this.log(element);
		if (activeFile) {
			// this.log(activeFile.basename)

			const targetLinks = Array.from(element.getElementsByTagName("img")).filter(
				(link) => {
					return link.src.lastIndexOf(':') === 3;//"app://...."
				}
			);

			let activePath = this.app.vault.getResourcePath(activeFile);
			this.log(activeView?.getEphemeralState());
			this.log(this.app.workspace);
			this.log(activePath);
			activePath = activePath ? activePath.substring(0, activePath.lastIndexOf("/")) : '';

			for (const link of targetLinks) {
				let cleanLink = link.src.replace('app://obsidian.md/', '');
				link.src = activePath + '/' + cleanLink;

			}
		}
	}

	useProcessMarkdown() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		this.log('activeView  ', activeView);
		const element = activeView?.contentEl;
		if (element) {
			this.processMarkdown(element);
		}
	}

	modifyHTML(el: HTMLElement, ctx: { sourcePath: string }) {
		// Perform additional modifications to HTML if needed
		this.log("Markdown rendering completed:", ctx.sourcePath);
	}

	/*
	scroll 子函数
	 */

	scrollLines = async (element: Element): Promise<number> => {

		// 获取元素的边界矩形
		let rect = element.getBoundingClientRect();

		// 获取元素的高度，可见高度，内容高度，滚动距离 总长度
		// 使用 const 声明常量，并添加类型注解
		const height: number = rect.height;
		const clientHeight: number = Math.round(element.clientHeight);
		// const scrollHeight: number = element.scrollHeight;
		const scrollTop: number = Math.round(element.scrollTop);
		// element.

		// 计算元素的每一行的高度，假设每一行的高度是相同的
		// 使用 const 声明常量，并添加类型注解
		const lineHeight: number = height / clientHeight;


		// 计算元素的滚动行数，也就是滚动了多少行
		// 使用 const 声明常量，并添加类型注解
		const scrollLines: number = Math.round(scrollTop / lineHeight);
		this.log('scrollHeight ', scrollTop % clientHeight - clientHeight / 4 < 0)
		if (scrollTop % clientHeight - clientHeight / 4 < 0) {
			this.log('in Scroll');
			this.useProcessMarkdown()
		}


		// 在控制台打印出滚动行数
		this.log('You scrollTop ' + scrollTop + '  ,Height =' + clientHeight + ', clientHeight ' + clientHeight + ' lines.');
		return scrollLines;
	};


	scroll_toUpdateView(activeView:MarkdownView) {
		let div = activeView.containerEl.querySelector('.cm-scroller');
		this.log(div)
		// @ts-ignore
		this.registerDomEvent(div, 'scroll', (event) => {
			// @ts-ignore
			this.scrollLines(div);
			// 在控制台打印出滚动的距离
			this.log('Editor Scrolled:   pixels vertically and pixels horizontally.');
		});
	}


}
