import { appendFile } from 'fs';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

// 定义插件里需要保存、用到的变量
interface MyPluginSettings {
	welcomeStr: string;
}

// 定义 DEFAULT_SETTINGS 并使用接口设置（DEFAULT_SETTINGS会在后边的插件主功能中的“loadSettings”（加载设置）中用到）
const DEFAULT_SETTINGS: MyPluginSettings = {
	welcomeStr: '欢迎来到 obsidian'
}

// 插件主功能设置！！
export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	// 异步：加载插件
	async onload() {
		await this.loadSettings();

		// 添加一条命令
		this.addCommand({
			id: 'simple-plugin-demo-command1',
			name: '简单插件命令示例',
			callback: () => {
				new Notice(this.settings.welcomeStr);
				new SampleModal(this.app).open();
			}
		});

		// 添加插件设置面板
		this.addSettingTab(new SampleSettingTab(this.app, this));
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
		title.setText("当前打开的文档名称");

		const {contentEl} = this;
		contentEl.setText(this.app.workspace.getActiveFile().name);
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
				.setValue(this.plugin.settings.welcomeStr)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.welcomeStr = value;
					console.log(this.plugin.settings.welcomeStr);
					await this.plugin.saveSettings();
				}));
	}
}
