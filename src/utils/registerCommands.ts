import TaskCountPlugin from "main";
import { TFile, MarkdownView } from "obsidian";
import { i18n } from "localization/localization";
import { updateTasksCount } from "./taskCount";
import { updateTaskNotesTaskCount } from "./taskNotesTaskCount";

export function registerCommands(plugin: TaskCountPlugin) {

    plugin.addCommand({
        id: "update-tasks-count",
        name: i18n.t("UPDATE_TASK_COUNT"),
        checkCallback: (checking: boolean) => {
          if (plugin.settings.enableTasksCount || plugin.settings.enableTaskNotesCount) {
            if (!checking) {
              let leaves = plugin.app.workspace.getLeavesOfType("markdown");
              for (let leaf of leaves) {
                if (leaf.view instanceof MarkdownView) {
                  let view = leaf.view
                  let file = view.file
                  if (file instanceof TFile) {
                    let cache = plugin.app.metadataCache.getFileCache(file)
    
                    if (plugin.settings.enableTaskNotesCount) {
                        void updateTaskNotesTaskCount(plugin, null, view)
                    }
        
                    if (plugin.settings.enableTasksCount && cache) {
                        void updateTasksCount(view, cache, plugin)
                    }
                  }
                }
              }
            }
            return true;
          }
          return false;
        }
    });

}


