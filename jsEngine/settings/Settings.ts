import type JsEnginePlugin from 'jsEngine/main';
import { StartupScriptsModal } from 'jsEngine/settings/StartupScriptModal';
import type { App, } from 'obsidian';
import { PluginSettingTab, Setting, setIcon, TFile } from 'obsidian';

export interface JsEnginePluginSettings {
	startupScripts?: string[];
  script_ids: string[];
  script_names: string[];
  scripts: string[];
}

export const JS_ENGINE_DEFAULT_SETTINGS: JsEnginePluginSettings = {
	startupScripts: [],
  script_ids: [],
  script_names: [],
  scripts: [],
};

export class JsEnginePluginSettingTab extends PluginSettingTab {
	plugin: JsEnginePlugin;

	constructor(app: App, plugin: JsEnginePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
    const { containerEl } = this;
		containerEl.empty();

  if (!this.plugin.settings) {
    return;
  }

  // Get all vault scripts
  let scriptPaths:string[];
  let scriptNames:string[];
  scriptPaths = [];
  scriptNames = [];
  let allFiles = this.app.vault.getAllLoadedFiles().filter((file) => file instanceof TFile);
  let scriptFiles = allFiles.filter((file) => file.extension === 'js');
  scriptPaths = scriptFiles.map(file => file.path);
  scriptNames = scriptFiles.map(file => file.name);

  // Startup scripts
  new Setting(containerEl).setName("Startup Scripts").addButton(button => {
    button.setButtonText('Manage').onClick(() => {
      new StartupScriptsModal(this.plugin).open();
    });
  });

  // Information heading for script commands
  //new Setting(containerEl).setName("Script Commands").setHeading();
  const descHeading = document.createDocumentFragment();
  descHeading.append(
    "Script commands allow you to run ",
    descHeading.createEl("strong", { text: "designated scripts " }),
    "from the command palette.",
    descHeading.createEl("br"),
    "These commands can also have a hotkey assigned to them in Obsidians Hotkeys settings.",
    descHeading.createEl("br"),
    descHeading.createEl("br"),
    descHeading.createEl("strong", { text: "How to use: " }),
    "In the first edit field enter a unique Command ID (Eg: execute-js-file-myscript)",
    descHeading.createEl("br"),
    "In the second edit field enter the menu text to display in the command palette (Eg: `Execute new note script`)",
    descHeading.createEl("br"),
    "This will be displayed in the command palette as ",
    descHeading.createEl("strong", { text: "JS Engine: Execute new note script" }),
    descHeading.createEl("br"),
    "In the third field dropdown select the script file to execute (the list contains all js files found in your vault)",
  );
  new Setting(containerEl).setName("Script Commands").setDesc(descHeading);

  // Add all script commands
  // this.plugin.settings.script_ids.forEach((script_ids, index) => {
  for (let [index, ids] of this.plugin.settings.script_ids.entries()) {
    //console.log('IDs',ids,'Index',index);

    const s = new Setting(this.containerEl);
  
    // Script Command ID
    s.addText((text) =>
      text
        .setPlaceholder('Command ID')
        .setValue(this.plugin.settings.script_ids[index])
        .then(textEl => {
          textEl.inputEl.style.width = '200px';
          textEl.inputEl.style.marginRight = "20px";
        })
        .onChange(async (value) => {
          this.plugin.settings.script_ids[index] = value;
          await this.plugin.saveSettings();
        })
      );

    // Script Menu text
    s.addText((text) =>
      text
        .setPlaceholder('Menu text')
        .setValue(this.plugin.settings.script_names[index])
        .then(textEl => {
          textEl.inputEl.style.width = '200px';
          textEl.inputEl.style.marginRight = "20px";
        })
        .onChange(async (value) => {
          this.plugin.settings.script_names[index] = value;
          await this.plugin.saveSettings();
        })
      );

    // Script filename
    s.addDropdown((cb) => {
      cb
      for (let i = 0; i < scriptPaths.length; i++) {
        cb.addOption(scriptPaths[i], scriptNames[i]);
      };
      cb.setValue(this.plugin.settings.scripts[index]);
      cb.onChange(async (value) => {
        this.plugin.settings.scripts[index] = value;
        await this.plugin.saveSettings();
      });
    });

    // Script delete button
    s.addButton((el) =>
      el
        .setButtonText(`Delete `)
        .setIcon("trash")
        .onClick(async () => {
          this.plugin.settings.script_ids.splice(index, 1);
          this.plugin.settings.script_names.splice(index, 1);
          this.plugin.settings.scripts.splice(index, 1);
          await this.plugin.saveSettings();
          this.display();
        }));
    };

    // Script add button
    new Setting(containerEl).addButton((el) =>
      el.setButtonText("Add script command").onClick(() => {
        this.plugin.settings.script_ids.push("");
        this.plugin.settings.script_names.push("");
        this.plugin.settings.scripts.push("");
        this.display(); // Update settings display
      }),
    )
    .addExtraButton(button => button
      .setIcon('refresh-ccw')
      .setTooltip("Reload Obsidian to implement changes")
      .onClick(() => {
        const app = this.app as any
        app.commands.executeCommandById('app:reload');
      })  
    );
  };
};
