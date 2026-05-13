import { MarkdownView, View, TFile, CachedMetadata } from "obsidian"
import TaskCountPlugin from "main"
import { getNestedProperty, setNestedProperty } from "./propertyUtils"




type status = {
    autoArchive: boolean;
    autoArchiveDelay: number;
    color: string;
    id: string;
    isCompleted: boolean;
    label: string;
    order: number;
    value: string;
}

type taskInfo = {
    path: string;
}

type taskLinkObj = {
    isValidTaskLink: boolean;
    taskInfo: taskInfo
}

interface TaskNotes {
  settings: {
    taskIdentificationMethod: string;
    taskTag: string;
    taskPropertyName: string;
    taskPropertyValue: string;
  };
  taskLinkDetectionService: {
    detectTaskLink(linkText: string): Promise<taskLinkObj>
  };
  statusManager: {
    statuses: status[]
  };
  projectSubtasksService: {
    getTasksLinkedToProject(file: TFile): Promise<unknown[]>
  };
}


export const needToUpdateTaskNotes = (plugin: TaskCountPlugin, cache?: CachedMetadata | null): boolean => {
    if (cache && plugin.settings.enableTaskNotesCount) {
        let isTask = false
        // @ts-expect-error, not typed
        let tn = plugin.app.plugins?.getPlugin("tasknotes") as TaskNotes | null
        if (tn) {
            let taskIdentificationMethod = tn.settings.taskIdentificationMethod
        
            if (taskIdentificationMethod == "tag") {
                let taskTag = tn.settings.taskTag
				let tags = cache.frontmatter?.tags as string[] | null
                if (tags && tags.includes(taskTag)) {
                    isTask = true
                }
            } else if (taskIdentificationMethod == "property") {
                let taskPropertyName = tn.settings.taskPropertyName
                if (typeof taskPropertyName == "string") {
                    let taskPropertyValue = tn.settings.taskPropertyValue
                    if (getNestedProperty(cache.frontmatter, taskPropertyName) == taskPropertyValue) {
                        isTask = true
                    }
                }
                
            } 
        } 
        return isTask
    }
    return false
}



export const updateTaskNotesTaskCount = async (plugin: TaskCountPlugin, file: TFile | null, view?: View): Promise<void> => {

    // @ts-expect-error, not typed
    let tn = plugin.app.plugins?.getPlugin("tasknotes") as TaskNotes | null

    if (!file && view instanceof MarkdownView) {
        file = view.file
    }

    if (tn && tn.taskLinkDetectionService && file instanceof TFile) {
        let statuses = tn.statusManager?.statuses
        
        let completedStatuses = statuses.filter((s: unknown) => {
            if (s && typeof s == "object" && "isCompleted" in s) {
                let status = s.isCompleted
                if (status) return true 
            }
            return false
        })

        let projectTasks = await tn.projectSubtasksService.getTasksLinkedToProject(file) 
        
        let completedProjectTasks = projectTasks.filter((t: unknown) => {
            let task = completedStatuses.find((s: unknown) => {
                if (s && typeof s == "object" && "value" in s &&
                    t && typeof t == "object" && "status" in t
                ) {
                    return s.value == t.status
                } else {
                    return false
                }
            })
            if (task) return true 
            else return false
        })

        let inlineTasks = []
        let tasks = []
        let completed = []
        let uncompleted = []

        let cache = plugin.app.metadataCache.getFileCache(file)

        
        if (cache) {
            let links = cache.links

            

            
            if (links) {
                for (let link of links) {
                    let linkText = link.original
                    let taskLinkObj = await tn.taskLinkDetectionService?.detectTaskLink(linkText)

                    
                    if (taskLinkObj?.isValidTaskLink) {
                        let task = taskLinkObj.taskInfo
                        inlineTasks.push(task)
                    }
                }
            }
            

            let listItems = cache.listItems;

            if (listItems) {
                let allTasksStatuses = plugin.settings.completedTasksStatuses.concat(plugin.settings.uncompletedTasksStatuses);
                tasks = listItems.filter((l) => l.task && allTasksStatuses.includes(l.task));
                completed = tasks.filter((t) => t.task && plugin.settings.completedTasksStatuses.includes(t.task));
                uncompleted = tasks.filter((t) => t.task && plugin.settings.uncompletedTasksStatuses.includes(t.task));
            }
        }

         

        let completedInlineTasks = inlineTasks.filter(t => {
            return completedStatuses.find((s: unknown) => {
                if (s && typeof s == "object" && "value" in s &&
                    t && typeof t == "object" && "status" in t
                ) {
                    return s.value == t.status
                } else {
                    return false
                }
            })
        })

        let allTasks = [...projectTasks]

        for (let task of inlineTasks) {
            if (!allTasks.find((t: taskInfo) => t.path == task.path)) {
                allTasks.push(task)
            }
        }

        let allCompletedTasks = allTasks.filter(t => {
            return completedStatuses.find((s: unknown) => {
                if (s && typeof s == "object" && "value" in s &&
                    t && typeof t == "object" && "status" in t
                ) {
                    return s.value == t.status
                } else {
                    return false
                }
            })
        })


       

        await plugin.app.fileManager.processFrontMatter(file, fm => {

            if (plugin.settings.allTNTasksCount && getNestedProperty(fm, plugin.settings.allTNTasksCount) !== undefined) {
                setNestedProperty(fm, plugin.settings.allTNTasksCount, allTasks.length);
            }

            if (plugin.settings.completedTNTasksCount && getNestedProperty(fm, plugin.settings.completedTNTasksCount) !== undefined) {
                setNestedProperty(fm, plugin.settings.completedTNTasksCount, allCompletedTasks.length);
            }

            if (plugin.settings.uncompletedTNTasksCount && getNestedProperty(fm, plugin.settings.uncompletedTNTasksCount) !== undefined) {
                setNestedProperty(fm, plugin.settings.uncompletedTNTasksCount, allTasks.length - allCompletedTasks.length);
            }

            if (plugin.settings.allTNProjectTasksCount && getNestedProperty(fm, plugin.settings.allTNProjectTasksCount) !== undefined) {
                setNestedProperty(fm, plugin.settings.allTNProjectTasksCount, projectTasks.length);
            }

            if (plugin.settings.completedTNProjectTasksCount && getNestedProperty(fm, plugin.settings.completedTNProjectTasksCount) !== undefined) {
                setNestedProperty(fm, plugin.settings.completedTNProjectTasksCount, completedProjectTasks.length);
            }

            if (plugin.settings.uncompletedTNProjectTasksCount && getNestedProperty(fm, plugin.settings.uncompletedTNProjectTasksCount) !== undefined) {
                setNestedProperty(fm, plugin.settings.uncompletedTNProjectTasksCount, projectTasks.length - completedProjectTasks.length);
            }

            if (plugin.settings.allTNInlineTasksCount && getNestedProperty(fm, plugin.settings.allTNInlineTasksCount) !== undefined) {
                setNestedProperty(fm, plugin.settings.allTNInlineTasksCount, inlineTasks.length);
            }

            if (plugin.settings.completedTNInlineTasksCount && getNestedProperty(fm, plugin.settings.completedTNInlineTasksCount) !== undefined) {
                setNestedProperty(fm, plugin.settings.completedTNInlineTasksCount, completedInlineTasks.length);
            }

            if (plugin.settings.uncompletedTNInlineTasksCount && getNestedProperty(fm, plugin.settings.uncompletedTNInlineTasksCount) !== undefined) {
                setNestedProperty(fm, plugin.settings.uncompletedTNInlineTasksCount, inlineTasks.length - completedInlineTasks.length);
            }

            if (plugin.settings.allTNAndCheckboxTasksCount && getNestedProperty(fm, plugin.settings.allTNAndCheckboxTasksCount) !== undefined) {
                setNestedProperty(fm, plugin.settings.allTNAndCheckboxTasksCount, allTasks.length + tasks.length);
            }

            if (plugin.settings.completedTNAndCheckboxTasksCount && getNestedProperty(fm, plugin.settings.completedTNAndCheckboxTasksCount) !== undefined) {
                setNestedProperty(fm, plugin.settings.completedTNAndCheckboxTasksCount, allCompletedTasks.length + completed.length);
            }

            if (plugin.settings.uncompletedTNAndCheckboxTasksCount && getNestedProperty(fm, plugin.settings.uncompletedTNAndCheckboxTasksCount) !== undefined) {
                setNestedProperty(fm, plugin.settings.uncompletedTNAndCheckboxTasksCount, allTasks.length - allCompletedTasks.length + uncompleted.length);
            }
        })
    }
}



export const updateTaskNotesTaskCountOnCacheChanged = (file: TFile, cache: CachedMetadata, plugin: TaskCountPlugin) => {
    if (plugin.settings.enableTaskNotesCount && plugin.settings.autoTasksCount) {
        let updateTaskNotes = needToUpdateTaskNotes(plugin, cache)
        let leaves = plugin.app.workspace.getLeavesOfType("markdown");
        let currentFile = plugin.app.workspace.getActiveFile()

        for (let leaf of leaves) {
            if (leaf.view instanceof MarkdownView) {
                if (updateTaskNotes || file == currentFile) {
                    void updateTaskNotesTaskCount(plugin, null, leaf.view)
                }
            }
        }
    }
}



export const updateAllTaskNotesTaskCounts = (plugin: TaskCountPlugin) => {
    if (plugin.settings.enableTaskNotesCount && plugin.settings.autoTasksCount) {
        
        let leaves = plugin.app.workspace.getLeavesOfType("markdown");
        for (let leaf of leaves) {
            let view = leaf.view;
            if (view instanceof MarkdownView) {
                let file = view.file
                if (file instanceof TFile) {
                    let cache = plugin.app.metadataCache.getFileCache(file)
                    if (cache) {
                        void updateTaskNotesTaskCount(plugin, null, leaf.view)
                    }
                }
            }
        }
    }
}
