import { FileUri } from '@theia/core/lib/common/file-uri';
import { injectable } from '@theia/core/shared/inversify';
import { ExecutableService } from '../common/protocol/executable-service';
import {
  arduinoCliPath,
  arduinoLanguageServerPath,
  clangdPath,
} from './resources';
import { spawn } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';

@injectable()
export class ExecutableServiceImpl implements ExecutableService {
  async list(): Promise<{
    clangdUri: string;
    cliUri: string;
    lsUri: string;
  }> {
    return {
      clangdUri: FileUri.create(clangdPath).toString(),
      cliUri: FileUri.create(arduinoCliPath).toString(),
      lsUri: FileUri.create(arduinoLanguageServerPath).toString(),
    };
  }

  async installCh340Driver(): Promise<void> {
    let command = '';
    let args: string[] = [];
    const platform = process.platform;
    // In an Electron app, process.resourcesPath points to the resources directory
    // which is where extraFiles are typically copied.
    const driverDir = path.join(process.resourcesPath, 'drivers', 'ch340-drivers');
    
    console.log(`Detected platform on backend: ${platform}`);

    if (platform === 'win32') {
      command = `"${path.join(driverDir, 'ch340.exe')}"`;
      args = ['/S']; // Silent installation for Windows installer
    } else if (platform === 'darwin') {
      const driverPkgPath = path.join(driverDir, 'ch340.pkg');
      try {
        await fs.chmod(driverPkgPath, 0o755); // Make the package executable
        console.log(`Set executable permissions for ${driverPkgPath}`);
      } catch (error) {
        console.error(`Failed to set executable permissions for ${driverPkgPath}:`, error);
        throw new Error(`Failed to prepare macOS installer: ${error}`);
      }
      const appleScript = `
        do shell script "installer -pkg \\"${driverPkgPath}\\" -target /" with administrator privileges
      `;
      command = 'osascript';
      args = ['-e', appleScript];
    } else if (platform === 'linux') {
      throw new Error(`Linux platform is not directly supported for CH340 driver installation via this method. Please install manually.`);
    } else {
      throw new Error(`Unsupported operating system: ${platform}`);
    }

    if (command) {
      console.log(`Executing command on backend: ${command} ${args.join(' ')}`);
      try {
        const child = spawn(command, args, {
          detached: true,
          stdio: 'inherit',
          shell: (platform === 'win32'),
        });

        child.on('close', (code) => {
          console.log(`Installer process exited with code ${code}`);
          if (code !== 0) {
            console.error(`CH340 driver installation failed with exit code ${code} on ${platform}.`);
          }
        });

        child.on('error', (err) => {
          console.error(`Failed to start installer process: ${err}`);
          throw err;
        });

        child.unref();
        console.log(`Driver installation process started for ${platform}. PID: ${child.pid}`);
      } catch (error) {
        console.error(`Error executing driver installer for ${platform}:`, error);
        throw error;
      }
    }
  }
}
