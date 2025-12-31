import { App, PluginSettingTab } from 'obsidian';
import { i18n } from './localization/localization';
import TaskCountPlugin from "./main";
import { Setting } from 'obsidian';
import { updateAllTaskCounts } from 'utils/taskCount';
import { updateAllTaskNotesTaskCounts } from 'utils/taskNotesTaskCount';

export interface TCPluginSettings {
    allTasksCount: string;
    completedTasksCount: string;
    uncompletedTasksCount: string;
    completedTasksStatuses: string[];
    uncompletedTasksStatuses: string[];
	enableTasksCount: boolean;
	enableTaskNotesCount: boolean;
	allTNTasksCount: string;
    completedTNTasksCount: string;
    uncompletedTNTasksCount: string;
	allTNProjectTasksCount: string;
    completedTNProjectTasksCount: string;
    uncompletedTNProjectTasksCount: string;
	allTNInlineTasksCount: string;
    completedTNInlineTasksCount: string;
    uncompletedTNInlineTasksCount: string;
	allTNAndCheckboxTasksCount: string;
    completedTNAndCheckboxTasksCount: string;
    uncompletedTNAndCheckboxTasksCount: string;
	autoTasksCount: boolean
}


export const DEFAULT_SETTINGS: TCPluginSettings = {
    allTasksCount: "tasks",
    completedTasksCount: "tasks_completed",
    uncompletedTasksCount: "tasks_uncompleted",
    completedTasksStatuses: ["x"],
    uncompletedTasksStatuses: [" "],
	enableTasksCount: true,
	enableTaskNotesCount: false,
	allTNTasksCount: "tn_tasks",
    completedTNTasksCount: "tn_tasks_completed",
    uncompletedTNTasksCount: "tn_tasks_uncompleted",
	allTNProjectTasksCount: "tn_project_tasks",
    completedTNProjectTasksCount: "tn_project_tasks_completed",
    uncompletedTNProjectTasksCount: "tn_project_tasks_uncompleted",
	allTNInlineTasksCount: "tn_inline_tasks",
    completedTNInlineTasksCount: "tn_inline_tasks_completed",
    uncompletedTNInlineTasksCount: "tn_inline_tasks_uncompleted",
	allTNAndCheckboxTasksCount: "tn_and_checkbox_tasks",
    completedTNAndCheckboxTasksCount: "tn_and_checkbox_tasks_completed",
    uncompletedTNAndCheckboxTasksCount: "tn_and_checkbox_tasks_uncompleted",
	autoTasksCount: true,
}


export class TCSettingTab extends PluginSettingTab {
	plugin: TaskCountPlugin;

	constructor(app: App, plugin: TaskCountPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		const plugin = this.plugin

		new Setting(containerEl)
			.setName(i18n.t("ENABLE_TASKS_COUNT"))
			.setDesc(i18n.t("TASKS_COUNT_DESC"))
			.addToggle(toggle => toggle
				.setValue(plugin.settings.enableTasksCount)
				.onChange(async (value) => {
					plugin.settings.enableTasksCount = value
					await plugin.saveSettings();
					void updateAllTaskCounts(plugin)
					this.display();
				}));

		if (plugin.settings.enableTasksCount) {
			new Setting(containerEl)
			.setName(i18n.t("ALL_TASKS_COUNT_PROPERTY"))
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('tasks')
				.setValue(plugin.settings.allTasksCount)
				.onChange(async (value) => {
					plugin.settings.allTasksCount = value;
					await plugin.saveSettings();
					void updateAllTaskCounts(plugin)
				}));

			new Setting(containerEl)
			.setName(i18n.t("UNCOMPLETED_TASKS_COUNT_PROPERTY"))
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('tasks_uncompleted')
				.setValue(plugin.settings.uncompletedTasksCount)
				.onChange(async (value) => {
					plugin.settings.uncompletedTasksCount = value;
					await plugin.saveSettings();
					void updateAllTaskCounts(plugin)
				}));

			new Setting(containerEl)
			.setName(i18n.t("COMPLETED_TASKS_COUNT_PROPERTY"))
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('tasks_completed')
				.setValue(plugin.settings.completedTasksCount)
				.onChange(async (value) => {
					plugin.settings.completedTasksCount = value;
					await plugin.saveSettings();
					void updateAllTaskCounts(plugin)
				}));

			containerEl.createEl("p", {text: i18n.t("TASK_STATUSES_DESCRIPTION")})

			new Setting(containerEl)
			.setName(i18n.t("UNCOMPLETED_TASKS_COUNT_STATUSES"))
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('" "')
				.setValue(plugin.settings.uncompletedTasksStatuses.map(s => "\"" + s + "\"").join(", "))
				.onChange(async (value) => {
					let valueArr = value.split(",").map(v => {
						v = v.trim()
						let stringMatch = v.match(/(")(.*?)(")/)
						if (stringMatch && stringMatch[2]) {
							v = stringMatch[2]
						}
						if (v.length > 1 && v[0]) {
							v = v[0]
						}
						return v
					}).filter(v => v != "" && !plugin.settings.completedTasksStatuses.includes(v))
					valueArr = Array.from(new Set(valueArr))
					plugin.settings.uncompletedTasksStatuses = valueArr;
					await plugin.saveSettings();
					void updateAllTaskCounts(plugin)
				}));

			new Setting(containerEl)
			.setName(i18n.t("COMPLETED_TASKS_COUNT_STATUSES"))
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('"x"')
				.setValue(plugin.settings.completedTasksStatuses.map(s => "\"" + s + "\"").join(", "))
				.onChange(async (value) => {
					let valueArr = value.split(",").map(v => {
						v = v.trim()
						let stringMatch = v.match(/(")(.*?)(")/)
						if (stringMatch && stringMatch[2]) {
							v = stringMatch[2]
						}
						if (v.length > 1 && v[0]) {
							v = v[0]
						}
						return v
					}).filter(v => v != "" && !plugin.settings.uncompletedTasksStatuses.includes(v))
					valueArr = Array.from(new Set(valueArr))
					plugin.settings.completedTasksStatuses = valueArr;
					await plugin.saveSettings();
					void updateAllTaskCounts(plugin)
				}));
		}

		new Setting(containerEl).setName(i18n.t("TASKNOTES_INTEGRATION")).setHeading();
		containerEl.createEl("p", {text: i18n.t("TASKNOTES_INTEGRATION_DESCRIPTION")})

		new Setting(containerEl)
			.setName(i18n.t("ENABLE_TASKSNOTES_COUNT"))
			.addToggle(toggle => toggle
				.setValue(plugin.settings.enableTaskNotesCount)
				.onChange(async (value) => {
					plugin.settings.enableTaskNotesCount = value
					await plugin.saveSettings();
					void updateAllTaskNotesTaskCounts(plugin)
					this.display();
				}));

		if (plugin.settings.enableTaskNotesCount) {
			new Setting(containerEl)
			.setName(i18n.t("TASKNOTES_PROJECT_COUNT_PROPERTY"))
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('tn_project_tasks')
				.setValue(plugin.settings.allTNProjectTasksCount)
				.onChange(async (value) => {
					plugin.settings.allTNProjectTasksCount = value;
					await plugin.saveSettings();
					void updateAllTaskNotesTaskCounts(plugin)
				}));

			new Setting(containerEl)
			.setName(i18n.t("TASKNOTES_PROJECT_COMPLETED_COUNT_PROPERTY"))
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('tn_project_tasks_completed')
				.setValue(plugin.settings.completedTNProjectTasksCount)
				.onChange(async (value) => {
					plugin.settings.completedTNProjectTasksCount = value;
					await plugin.saveSettings();
					void updateAllTaskNotesTaskCounts(plugin)
				}));

			new Setting(containerEl)
			.setName(i18n.t("TASKNOTES_PROJECT_UNCOMPLETED_COUNT_PROPERTY"))
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('tn_project_tasks_uncompleted')
				.setValue(plugin.settings.uncompletedTNProjectTasksCount)
				.onChange(async (value) => {
					plugin.settings.uncompletedTNProjectTasksCount = value;
					await plugin.saveSettings();
					void updateAllTaskNotesTaskCounts(plugin)
				}));

			new Setting(containerEl)
			.setName(i18n.t("TASKNOTES_INLINE_COUNT_PROPERTY"))
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('tn_inline_tasks')
				.setValue(plugin.settings.allTNInlineTasksCount)
				.onChange(async (value) => {
					plugin.settings.allTNInlineTasksCount = value;
					await plugin.saveSettings();
					void updateAllTaskNotesTaskCounts(plugin)
				}));

			new Setting(containerEl)
			.setName(i18n.t("TASKNOTES_INLINE_COMPLETED_COUNT_PROPERTY"))
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('tn_inline_tasks_completed')
				.setValue(plugin.settings.completedTNInlineTasksCount)
				.onChange(async (value) => {
					plugin.settings.completedTNInlineTasksCount = value;
					await plugin.saveSettings();
					void updateAllTaskNotesTaskCounts(plugin)
				}));

			new Setting(containerEl)
			.setName(i18n.t("TASKNOTES_INLINE_UNCOMPLETED_COUNT_PROPERTY"))
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('tn_inline_tasks_uncompleted')
				.setValue(plugin.settings.uncompletedTNInlineTasksCount)
				.onChange(async (value) => {
					plugin.settings.uncompletedTNInlineTasksCount = value;
					await plugin.saveSettings();
					void updateAllTaskNotesTaskCounts(plugin)
				}));

			new Setting(containerEl)
			.setName(i18n.t("TASKNOTES_COUNT_PROPERTY"))
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('tn_tasks')
				.setValue(plugin.settings.allTNTasksCount)
				.onChange(async (value) => {
					plugin.settings.allTNTasksCount = value;
					await plugin.saveSettings();
					void updateAllTaskNotesTaskCounts(plugin)
				}));

			new Setting(containerEl)
			.setName(i18n.t("TASKNOTES_COMPLETED_COUNT_PROPERTY"))
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('tn_tasks_completed')
				.setValue(plugin.settings.completedTNTasksCount)
				.onChange(async (value) => {
					plugin.settings.completedTNTasksCount = value;
					await plugin.saveSettings();
					void updateAllTaskNotesTaskCounts(plugin)
				}));

			new Setting(containerEl)
			.setName(i18n.t("TASKNOTES_UNCOMPLETED_COUNT_PROPERTY"))
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('tn_tasks_uncompleted')
				.setValue(plugin.settings.uncompletedTNTasksCount)
				.onChange(async (value) => {
					plugin.settings.uncompletedTNTasksCount = value;
					await plugin.saveSettings();
					void updateAllTaskNotesTaskCounts(plugin)
				}));
			
			new Setting(containerEl)
			.setName(i18n.t("TASKNOTES_AND_CHECKBOX_COUNT_PROPERTY"))
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('all_tasks')
				.setValue(plugin.settings.allTNAndCheckboxTasksCount)
				.onChange(async (value) => {
					plugin.settings.allTNAndCheckboxTasksCount = value;
					await plugin.saveSettings();
					void updateAllTaskNotesTaskCounts(plugin)
				}));

			new Setting(containerEl)
			.setName(i18n.t("TASKNOTES_AND_CHECKBOX_COMPLETED_COUNT_PROPERTY"))
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('all_tasks_completed')
				.setValue(plugin.settings.completedTNAndCheckboxTasksCount)
				.onChange(async (value) => {
					plugin.settings.completedTNAndCheckboxTasksCount = value;
					await plugin.saveSettings();
					void updateAllTaskNotesTaskCounts(plugin)
				}));

			new Setting(containerEl)
			.setName(i18n.t("TASKNOTES_AND_CHECKBOX_UNCOMPLETED_COUNT_PROPERTY"))
			.addText(text => text
				// eslint-disable-next-line obsidianmd/ui/sentence-case
				.setPlaceholder('all_tasks_uncompleted')
				.setValue(plugin.settings.uncompletedTNAndCheckboxTasksCount)
				.onChange(async (value) => {
					plugin.settings.uncompletedTNAndCheckboxTasksCount = value;
					await plugin.saveSettings();
					void updateAllTaskNotesTaskCounts(plugin)
				}));
		}



		if (plugin.settings.enableTasksCount || plugin.settings.enableTaskNotesCount) {
			new Setting(containerEl)
				.setName(i18n.t("AUTOMATIC_TASKS_COUNT"))
				.setDesc(i18n.t("AUTOMATIC_TASKS_COUNT_DESC"))
				.addToggle((toggle) => toggle
				.setValue(plugin.settings.autoTasksCount)
				.onChange(async (value) => {
					plugin.settings.autoTasksCount = value;
					await plugin.saveSettings();
					void updateAllTaskCounts(plugin)
					void updateAllTaskNotesTaskCounts(plugin)
					this.display();
				}));
		}
	}
}
