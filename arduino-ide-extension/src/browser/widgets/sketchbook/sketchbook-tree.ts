import { inject, injectable } from '@theia/core/shared/inversify';
import { Command } from '@theia/core/lib/common/command';
import { CompositeTreeNode, TreeNode } from '@theia/core/lib/browser/tree';
import { DirNode, FileStatNode } from '@theia/filesystem/lib/browser/file-tree';
import { SketchesService } from '../../../common/protocol';
import { SketchbookCommands } from './sketchbook-commands';
import {
  FileNavigatorTree,
  WorkspaceRootNode,
} from '@theia/navigator/lib/browser/navigator-tree';
import { ArduinoPreferences } from '../../arduino-preferences';
import { nls } from '@theia/core/lib/common/nls';

@injectable()
export class SketchbookTree extends FileNavigatorTree {
  @inject(SketchesService)
  protected readonly sketchesService: SketchesService;

  @inject(ArduinoPreferences)
  protected readonly arduinoPreferences: ArduinoPreferences;

  override async resolveChildren(
    parent: CompositeTreeNode
  ): Promise<TreeNode[]> {
    const showAllFiles =
      this.arduinoPreferences['arduino.sketchbook.showAllFiles'];

    const children = (await super.resolveChildren(parent)).filter((child) => {
      // strip libraries and hardware directories
      if (
        DirNode.is(child) &&
        ['libraries', 'hardware'].includes(child.fileStat.name) &&
        WorkspaceRootNode.is(child.parent)
      ) {
        return false;
      }

      // strip files if only directories are admitted
      if (!DirNode.is(child) && !showAllFiles) {
        return false;
      }

      // strip hidden files
      if (FileStatNode.is(child) && child.fileStat.name.indexOf('.') === 0) {
        return false;
      }

      return true;
    });

    if (DirNode.is(parent) && children.length === 0) {
      delete (parent as any).expanded;
    }

    return await Promise.all(
      children.map(
        async (childNode) => await this.decorateNode(childNode, showAllFiles)
      )
    );
  }

  protected async isSketchNode(node: DirNode): Promise<boolean> {
    const sketch = await this.sketchesService.maybeLoadSketch(
      node.uri.toString()
    );
    return !!sketch;
  }

  /**
   * Add commands available for the given node
   * @param node
   * @returns
   */
  protected async augmentSketchNode(node: DirNode): Promise<void> {
    Object.assign(node, {
      type: 'sketch',
      commands: [
        [
          'arduino-create-cloud-copy',
          nls.localize('arduino/createCloudCopy', 'Push Sketch to Cloud'),
        ],
        SketchbookCommands.OPEN_SKETCHBOOK_CONTEXT_MENU,
      ],
    });
  }

  protected async decorateNode(
    node: TreeNode,
    showAllFiles: boolean
  ): Promise<TreeNode> {
    if (DirNode.is(node) && (await this.isSketchNode(node))) {
      await this.augmentSketchNode(node);

      if (!showAllFiles) {
        delete (node as any).expanded;
        node.children = [];
      } else {
        node.expanded = 'expanded' in node ? node.expanded : false;
      }
    }
    return node;
  }
}

export namespace SketchbookTree {
  export interface SketchDirNode extends DirNode {
    readonly type: 'sketch';
    /**
     * Theia command, the command ID string, or a tuple of command ID and preferred UI label. If the array construct is used, the label is the 1<sup>st</sup> of the array.
     */
    readonly commands?: (Command | string | [string, string])[];
  }
  export namespace SketchDirNode {
    export function is(
      node: (TreeNode & Partial<SketchDirNode>) | undefined
    ): node is SketchDirNode {
      return !!node && node.type === 'sketch' && DirNode.is(node);
    }
  }
}
