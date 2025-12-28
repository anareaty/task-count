# Task Count

This plugin used to be a part of my another plugin, [Pretty Properties](https://github.com/anareaty/pretty-properties) and has all it's current functional related to tasks counting. I decided to split it off into a separate plugin for the people who don't need all the other Pretty Properties features.

I am planning to remove task count functional from Pretty Properties in the future, but untill it's done, please, don't use these two plugins together, since it would make the same code run twice and can lead to unexpected results.

## Usage

In the plugin settings you can set special properties for tasks. If you add this properties to your note, the plugin will count existing tasks in the active note and save the count number to the properties. There are various kinds of properties that can be used to count differet kinds of tasks. You can select only the ones you need and ignore the others. The count will be done if at least one of the properties is present in the note.

The plugin can count regular checkbox tasks, written in the note. If TaskNotes support is enabled, it can also count the tasks created by TaskNotes plugin and related to the current note. 

If automatic update setting is enabled, the task count will be saved every time you make changes to the tasks. However it can affect performance and lead to annoying notifications appearing as you type. The alternative is to disable this option and update tasks manually using the "Update task count" command.
