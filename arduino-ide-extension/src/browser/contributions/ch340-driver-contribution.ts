import { Command, CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, nls } from '@theia/core/lib/common';
import { CommandService } from '@theia/core/lib/common';
import { BoardsService, ExecutableService } from '../../common/protocol'; // Import BoardsService and ExecutableService from common/protocol
import { inject, injectable } from 'inversify';
import { ArduinoMenus } from '../menu/arduino-menus';

export namespace Ch340DriverCommands {
  export const INSTALL_CH340_DRIVER: Command = {
    id: 'arduino-ide.ch340-driver.install',
    label: nls.localize('arduino/ch340-driver/install', 'Install CH340 Driver'),
  };
  export const CH340_DRIVER_INSTRUCTIONS: Command = {
    id: 'arduino-ide.ch340-driver.instructions',
    label: nls.localize(
      'arduino/ch340-driver/instructions',
      'CH340 Driver Installation Instructions'
    ),
  };
}

@injectable()
export class Ch340DriverCommandContribution implements CommandContribution {
  constructor(
    @inject(CommandService)
    protected commandService: CommandService,
    @inject(BoardsService) // Inject the interface
    protected boardsService: BoardsService, // Type with the interface
    @inject(ExecutableService)
    protected executableService: ExecutableService
  ) {}

  registerCommands(commands: CommandRegistry): void {
    commands.registerCommand(Ch340DriverCommands.INSTALL_CH340_DRIVER, {
      execute: () => this.installCh340Driver(),
    });
    commands.registerCommand(Ch340DriverCommands.CH340_DRIVER_INSTRUCTIONS, {
      execute: () =>
        this.commandService.executeCommand(
          'vscode.open',
          'https://ptsolns.com/CH340'
        ),
    });
  }

  protected async installCh340Driver(): Promise<void> {
    if (navigator.platform.indexOf('Win') > -1) { // Check if it's Windows
      try {
        await this.executableService.installCh340Driver();
        console.log('CH340 Driver installation initiated successfully.');
      } catch (error) {
        console.error('Failed to initiate CH340 Driver installation:', error);
      }
    } else {
      // Not Windows, navigate to the instructions page
      await this.commandService.executeCommand(
        'vscode.open',
        'https://ptsolns.com/pages/ch340-driver#downloading-the-ch340-driver-manually'
      );
      console.log('Navigated to CH340 Driver manual installation instructions for non-Windows OS.');
    }
  }
}

@injectable()
export class Ch340DriverMenuContribution implements MenuContribution {
  registerMenus(menus: MenuModelRegistry): void {
    menus.registerMenuAction(ArduinoMenus.TOOLS__CH340_DRIVER_GROUP, {
      commandId: Ch340DriverCommands.INSTALL_CH340_DRIVER.id,
      label: Ch340DriverCommands.INSTALL_CH340_DRIVER.label,
    });
    menus.registerMenuAction(ArduinoMenus.TOOLS__CH340_DRIVER_GROUP, {
      commandId: Ch340DriverCommands.CH340_DRIVER_INSTRUCTIONS.id,
      label: Ch340DriverCommands.CH340_DRIVER_INSTRUCTIONS.label,
    });
  }
}
