import { inject, injectable } from '@theia/core/shared/inversify';
import { EditorManager } from '@theia/editor/lib/browser/editor-manager';
import { WindowService } from '@theia/core/lib/browser/window/window-service';
import { CommandHandler } from '@theia/core/lib/common/command';
import { ArduinoMenus } from '../menu/arduino-menus';
import { QuickInputService } from '@theia/core/lib/browser/quick-input/quick-input-service';
import {
  Contribution,
  Command,
  MenuModelRegistry,
  CommandRegistry,
} from './contribution';
import { nls } from '@theia/core/lib/common';
import { IDEUpdaterCommands } from '../ide-updater/ide-updater-commands';
import { ElectronCommands } from '@theia/core/lib/electron-browser/menu/electron-menu-contribution';

@injectable()
export class Help extends Contribution {
  @inject(EditorManager)
  protected readonly editorManager: EditorManager;

  @inject(WindowService)
  protected readonly windowService: WindowService;

  @inject(QuickInputService)
  protected readonly quickInputService: QuickInputService;

  override registerCommands(registry: CommandRegistry): void {
    const open = (url: string) =>
      this.windowService.openNewWindow(url, { external: true });
    const createOpenHandler = (url: string) =>
      <CommandHandler>{
        execute: () => open(url),
      };
    registry.registerCommand(
      Help.Commands.PTSOLNS_GPT,
      createOpenHandler('https://chatgpt.com/g/g-68faecd6f4b4819193f1591c861f2d14-ptsolns-ide-gpt')
    );
    registry.registerCommand(
      Help.Commands.VISIT_PTSOLNS,
      createOpenHandler('https://PTSolns.com/')
    );
    registry.registerCommand(
      Help.Commands.PRIVACY_POLICY,
      createOpenHandler('https://ptsolns.com/pages/privacy-policy')
    );
    registry.registerCommand(
      Help.Commands.SUBMIT_BUG_TICKET,
      createOpenHandler('https://github.com/PTSolns/PTSolns-IDE/issues/new?template=bug_report.yml')
    );

  }



  override registerMenus(registry: MenuModelRegistry): void {
    registry.unregisterMenuAction({
      commandId: ElectronCommands.TOGGLE_DEVELOPER_TOOLS.id,
    });

    registry.registerMenuAction(ArduinoMenus.HELP__MAIN_GROUP, {
      commandId: Help.Commands.PTSOLNS_GPT.id,
      order: '0',
    });
    registry.registerMenuAction(ArduinoMenus.HELP__FIND_GROUP, {
      commandId: Help.Commands.VISIT_PTSOLNS.id,
      order: '6',
    });
    registry.registerMenuAction(ArduinoMenus.HELP__FIND_GROUP, {
      commandId: Help.Commands.PRIVACY_POLICY.id,
      order: '7',
    });
    registry.registerMenuAction(ArduinoMenus.HELP__FIND_GROUP, {
      commandId: IDEUpdaterCommands.CHECK_FOR_UPDATES.id,
      order: '8',
    });
    registry.registerMenuAction(ArduinoMenus.HELP__FIND_GROUP, {
      commandId: Help.Commands.SUBMIT_BUG_TICKET.id,
      order: '9',
    });

  }

}

export namespace Help {
  export namespace Commands {
    export const PTSOLNS_GPT: Command = {
      id: 'arduino-getting-started',
      label: nls.localize('arduino/help/ptsolnsGpt', 'PTSolns IDE GPT'),
      category: 'Arduino',
    };
    export const VISIT_PTSOLNS: Command = {
      id: 'arduino-visit-arduino',
      label: nls.localize('arduino/help/visit', 'Visit PTSolns.com'),
      category: 'Arduino',
    };
    export const PRIVACY_POLICY: Command = {
      id: 'arduino-privacy-policy',
      label: nls.localize('arduino/help/privacyPolicy', 'Privacy Policy'),
      category: 'Arduino',
    };
    export const SUBMIT_BUG_TICKET: Command = {
      id: 'arduino-submit-bug-ticket',
      label: nls.localize('arduino/help/submitBugTicket', 'Submit a Bug Ticket'),
      category: 'Arduino',
    };

  }
}
