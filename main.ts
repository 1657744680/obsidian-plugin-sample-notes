import { appendFile } from 'fs';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

// 定义插件里需要保存、用到的变量
interface MyPluginSettings {
	mySetting: string;
}

// 定义 DEFAULT_SETTINGS 并使用接口设置（DEFAULT_SETTINGS会在后边的插件主功能中的“loadSettings”（加载设置）中用到）
const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

// 插件主功能设置！！
export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	// 异步：加载插件
	async onload() {
		await this.loadSettings();

		// ======================================= 添加侧边栏图标、底部状态栏 ======================================= 
		// 可以看到创建这两个东西时是使用Plugin的函数来创建，并返回一个元素HtmlElement以方便后续其他操作

		// 侧边栏图标
		// This creates an icon in the left ribbon.
		// 在左侧侧边栏创建一个图标，并且点击会调用下列函数
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			// 点击图标会调用本大括号内的函数
			new Notice('This is a notice!');
			new SampleModal(this.app).open();
		});

		// Perform additional things with the ribbon
		// 用侧边栏做额外的事情
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// 底部状态栏
		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// 这将在应用程序的底部添加一个状态栏项。不适用于移动应用程序。
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// ======================================= 添加命令 ======================================= 
		// 也是用Plugin的函数来创建命令，但是由于不像前面的侧边栏图标等需要后续其它操作，所以也就没有返回一个HTML元素

		// This adds a simple command that can be triggered anywhere
		// 添加一个简单的可随处触发的命令
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});

		// 添加一个对当前编辑器实例进行某些操作的命令
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());					// 输出选中的文本
				editor.replaceSelection('Sample Editor Command');	// 替换文本
			}
		});

		// 添加一个可以检查应用程序的当前状态是否允许执行该命令的命令
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// ======================================= 添加插件设置TAB ======================================= 
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// ======================================= 添加一个全局事件监听器 ======================================= 
		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// 如果插件挂起了任何全局DOM事件(应用程序中不属于该插件的部分)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// 当该插件被禁用时，此函数会自动的移除事件监听器
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// 注册间隔的话，当插件被禁用时这个函数会自动清除间隔
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	// 卸载插件
	onunload() {

	}

	// 异步：加载设置
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	// 异步：保存设置
	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// Modal：实现接口CloseableComponent（可关闭组件）的类
class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const title = this.titleEl
		const {contentEl} = this;
		contentEl.setText('Woah!');
		title.setText("插件标题");
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

// 插件设置页面
class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		// 新建一个h2元素当标题
		containerEl.createEl('h2', {text: '插件设置面板.'});

		// 新建一个设置选项
		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					console.log(this.plugin.settings.mySetting);
					await this.plugin.saveSettings();
				}));
	}
}
