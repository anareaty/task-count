import { Plugin } from "obsidian";
import { i18n } from "./localization/localization";
import { TCSettingTab, TCPluginSettings, DEFAULT_SETTINGS } from "./settings";
import { registerCommands } from "./utils/registerCommands";
import { updateTaskNotesTaskCount, updateTaskNotesTaskCountOnCacheChanged } from "./utils/taskNotesTaskCount";
import { updateTaskCountOnCacheChanged } from "./utils/taskCount";


export default class TaskCountPlugin extends Plugin {
	settings: TCPluginSettings;
	patches: Record<string, any>

	async onload() {
		await this.loadSettings();
		i18n.setLocale();
		registerCommands(this)
		
		this.registerEvent(
			this.app.metadataCache.on("changed", async (file, data, cache) => {
				updateTaskCountOnCacheChanged(file, cache, this)
				updateTaskNotesTaskCountOnCacheChanged(file, cache, this)
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-open", async (file) => {
				if (file && this.settings.enableTaskNotesCount && this.settings.autoTasksCount) {
					updateTaskNotesTaskCount(this, file)
				}
			})
		);

		this.addSettingTab(new TCSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		)
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
