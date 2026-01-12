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

    command = `"${path.join(driverDir, 'ch340.exe')}"`;
    args = ['/S']; // Silent installation for Windows installer

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
