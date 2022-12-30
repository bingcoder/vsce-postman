import * as fs from 'fs';
import { nanoid } from 'nanoid';
import * as path from 'path';
import * as vscode from 'vscode';
import { request } from './axios';

class TreeItemFile {
  k = nanoid();
  create_time = +new Date();
  ft = vscode.FileType.File;
  title: string;
  pk: string | null;
  method?: string;
  url?: string;
  constructor(config: Pick<TreeItem, 'pk' | 'title'>) {
    this.title = config.title;
    this.pk = config.pk;
  }
}
class TreeItemDirectory {
  k = nanoid();
  create_time = +new Date();
  ft = vscode.FileType.Directory;
  title: string;
  pk: string | null;
  env = [];
  constructor(config: Pick<TreeItem, 'pk' | 'title'>) {
    this.title = config.title;
    this.pk = config.pk;
  }
}

type TreeItem = TreeItemFile | TreeItemDirectory;

const extensionKey = 'vscPostman';
const historyFileName = 'history.json';

class PostmanDataProvider implements vscode.TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<any> =
    new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData: vscode.Event<any> =
    this._onDidChangeTreeData.event;

  records: TreeItem[] = [];
  historyPath: string;
  context: vscode.ExtensionContext;
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    const globalStoragePath = context.globalStorageUri.fsPath;
    this.historyPath = path.join(globalStoragePath, historyFileName);
    const exist = fs.existsSync(globalStoragePath);

    if (!exist) {
      fs.mkdirSync(globalStoragePath);
    }
    if (!fs.existsSync(this.historyPath)) {
      fs.writeFileSync(this.historyPath, JSON.stringify([]));
    }
    this.refresh();
  }

  storage() {
    // TODO json 格式
    fs.writeFileSync(this.historyPath, JSON.stringify(this.records, null, 2));
    this._onDidChangeTreeData.fire(undefined);
  }

  refresh() {
    this.records = this.getRecordFromStore();
    this._onDidChangeTreeData.fire(undefined);
  }

  getRecordFromStore() {
    try {
      const records = JSON.parse(
        fs.readFileSync(this.historyPath).toString() || '[]'
      );
      if (!Array.isArray(records)) return [];
      return records;
    } catch (error) {
      return [];
    }
  }

  getChildren(element: TreeItem) {
    return this.records.filter((item) =>
      element ? item.pk === element.k : item.pk === null
    );
  }

  getFileIconPath(element: TreeItemFile) {
    if (element.method) {
      return `${this.context.extensionPath}/media/${element.method}.png`;
    }
    return new vscode.ThemeIcon('file');
  }
  getFileTooltip(element: TreeItemFile) {
    if (element.ft === vscode.FileType.File && element.url) {
      return `${element.url}`;
    }
  }

  getTreeItem(element: TreeItem) {
    const type =
      element.ft === vscode.FileType.File ? 'file' : 'file-directory';
    const treeItem: vscode.TreeItem = {
      label: `${element.title}`,
      tooltip: this.getFileTooltip(element),
      iconPath:
        element.ft === vscode.FileType.File
          ? this.getFileIconPath(element)
          : new vscode.ThemeIcon('file-directory'),
      collapsibleState:
        element.ft === vscode.FileType.Directory
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.None,
      contextValue: type,
    };

    if (element.ft === vscode.FileType.File) {
      treeItem.command = {
        command: 'vscPostman.openFile',
        title: 'Open File',
        arguments: [element],
      };
      treeItem.contextValue = 'file';
    }
    return treeItem;
  }
}

const dropMimeTypes = 'application/vnd.code.tree.vscPostmanDrop';
class PostmanView implements vscode.TreeDragAndDropController<TreeItem> {
  readonly dropMimeTypes = [dropMimeTypes];
  readonly dragMimeTypes = ['text/uri-list'];

  readonly treeDataProvider: PostmanDataProvider;
  readonly view: vscode.TreeView<TreeItem>;
  readonly historyPath: string;
  readonly context: vscode.ExtensionContext;
  panelList: { k: string; panel: vscode.WebviewPanel }[] = [];
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.historyPath = path.join(
      context.globalStorageUri.fsPath,
      historyFileName
    );
    this.treeDataProvider = new PostmanDataProvider(context);
    this.view = vscode.window.createTreeView('vsc-postman-side', {
      treeDataProvider: this.treeDataProvider,
      showCollapseAll: true,
      dragAndDropController: this,
    });

    context.subscriptions.push(this.view);
    vscode.commands.registerCommand('vscPostman.refresh', () =>
      this.treeDataProvider.refresh()
    );
    vscode.commands.registerCommand('vscPostman.showHistory', () => {
      if (fs.existsSync(this.historyPath)) {
        vscode.window.showTextDocument(vscode.Uri.file(this.historyPath));
      }
    });
    vscode.commands.registerCommand('vscPostman.addFromTitle', () => {
      this.addFromTitle(vscode.FileType.File);
    });
    vscode.commands.registerCommand('vscPostman.addFolderFromTitle', () => {
      this.addFromTitle(vscode.FileType.Directory);
    });
    vscode.commands.registerCommand('vscPostman.add', this.add);
    vscode.commands.registerCommand('vscPostman.rename', this.rename);
    vscode.commands.registerCommand('vscPostman.delete', this.deleteItem);
    vscode.commands.registerCommand(
      'vscPostman.openFile',
      this.handleItemClick
    );
  }

  async handleDrag(
    source: TreeItem[],
    treeDataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): Promise<void> {
    treeDataTransfer.set(dropMimeTypes, new vscode.DataTransferItem(source));
  }

  async handleDrop(
    target: TreeItem | undefined,
    sources: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): Promise<void> {
    const transferItem = sources.get(dropMimeTypes);
    if (!transferItem) {
      return;
    }
    const treeItems: TreeItem[] = transferItem.value;
    treeItems.forEach((item) => {
      if (!target) {
        item.pk = null;
      } else {
        item.pk =
          target.ft === vscode.FileType.Directory ? target.k : target.pk;
      }
    });
    this.treeDataProvider.storage();
  }

  async addFromTitle(ft: vscode.FileType) {
    const [selectItem] = this.view.selection;
    const title = await vscode.window.showInputBox({
      prompt: 'Type the new title',
      placeHolder: 'Type the new title',
    });
    let pk: any = null;
    let TreeItemClass =
      ft === vscode.FileType.Directory ? TreeItemDirectory : TreeItemFile;
    if (selectItem?.ft === vscode.FileType.File) {
      pk = selectItem.pk;
    } else if (selectItem?.ft === vscode.FileType.Directory) {
      pk = selectItem.k;
    }
    if (title?.trim()) {
      const item = new TreeItemClass({ pk, title });
      this.treeDataProvider.records = [...this.treeDataProvider.records, item];
      this.treeDataProvider.storage();
      if (ft === vscode.FileType.File) {
        this.handleItemClick(item);
      }
    }
  }

  add = async (directory: TreeItemDirectory) => {
    const title = await vscode.window.showInputBox({
      prompt: 'Type the new title',
      placeHolder: 'Type the new title',
    });
    if (title?.trim()) {
      const item = new TreeItemFile({
        pk: directory.k,
        title,
      });
      this.treeDataProvider.records = [...this.treeDataProvider.records, item];
      this.treeDataProvider.storage();
      this.handleItemClick(item);
    }
  };

  deleteItem = (item: TreeItem) => {
    const nodeMap: Record<string, TreeItem[]> = {};
    this.treeDataProvider.records.forEach((item) => {
      const key = `${item.pk}`;
      if (nodeMap[key]) {
        nodeMap[key].push(item);
      } else {
        nodeMap[key] = [item];
      }
    });

    const key: string[] = [];
    (function getChildrenRecursion(root: TreeItem[]) {
      root.forEach((item) => {
        key.push(item.k);
        if (nodeMap[item.k]) {
          getChildrenRecursion(nodeMap[item.k]);
        }
      });
    })([item]);
    this.treeDataProvider.records = this.treeDataProvider.records.filter(
      (item) => !key.includes(item.k)
    );
    this.treeDataProvider.storage();
    const disposePanels = this.panelList.filter((panel) =>
      key.includes(panel.k)
    );
    disposePanels.forEach((panel) => {
      panel.panel.dispose();
    });
  };

  rename = async (item: TreeItem) => {
    const title = await vscode.window.showInputBox({
      prompt: 'Type the new title',
      value: item.title,
    });
    if (title?.trim()) {
      item.title = title;
      this.treeDataProvider.storage();
      const itemPanel = this.panelList.find((panel) => panel.k === item.k);
      if (itemPanel) {
        itemPanel.panel.title = item.title;
      }
    }
  };

  save = (value: TreeItemFile) => {
    const index = this.treeDataProvider.records.findIndex(
      (item) => item.k === value.k
    );
    if (index > -1) {
      this.treeDataProvider.records[index] = value;
      this.treeDataProvider.storage();
    }
  };

  saveRecord = (value: TreeItemFile) => {
    const index = this.treeDataProvider.records.findIndex(
      (item) => item.k === value.k
    );
    if (index > -1) {
      (this.treeDataProvider.records[index] as TreeItemFile) = value;
      vscode.window.showInformationMessage('保存成功');
      this.treeDataProvider.storage();
    }
  };

  saveGroupEnv = (value: TreeItemDirectory) => {
    const index = this.treeDataProvider.records.findIndex(
      (item) => item.title === value.title
    );
    if (index > -1) {
      (this.treeDataProvider.records[index] as TreeItemDirectory).env =
        value.env;
      vscode.window.showInformationMessage('保存成功');
      this.treeDataProvider.storage();
    }
  };

  receiveMessageHandler = {
    request,
    saveRecord: this.saveRecord,
    saveGroupEnv: this.saveGroupEnv,
  };

  createWebviewPanel = (item: TreeItem) => {
    const panel = vscode.window.createWebviewPanel(
      extensionKey,
      item.title,
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    panel.webview.onDidReceiveMessage(
      (message: {
        type: keyof PostmanView['receiveMessageHandler'];
        value: any;
      }) => {
        this.receiveMessageHandler[message.type]?.(message.value, panel);
      }
    );

    const monacoScript = panel.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(this.context.extensionPath, 'build/lib/monaco/main.js')
      )
    );
    const prettierScript = panel.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(this.context.extensionPath, 'build/lib/prettier.min.js')
      )
    );
    const prettierBabelScript = panel.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(
          this.context.extensionPath,
          'build/lib/prettier.parser-babel.min.js'
        )
      )
    );

    const script = panel.webview.asWebviewUri(
      vscode.Uri.file(path.join(this.context.extensionPath, 'build/index.js'))
    );
    const css = panel.webview.asWebviewUri(
      vscode.Uri.file(path.join(this.context.extensionPath, 'build/style.css'))
    );

    panel.webview.html = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <div id="root"></div>
        <script>
          const webviewVscode = acquireVsCodeApi();
        </script>
        <script crossorigin src=${monacoScript}></script>
        <script crossorigin src=${prettierScript}></script>
        <script crossorigin src=${prettierBabelScript}></script>
        <script type="module" crossorigin src=${script}></script>
        <link rel="stylesheet" href=${css}>  
      </body>
    </html>`;
    return panel;
  };

  getPanel = (item: TreeItem) =>
    this.panelList.find((panel) => panel.k === item.k);

  handleItemClick = (item: TreeItem) => {
    const itemPanel = this.getPanel(item);
    if (itemPanel) {
      itemPanel.panel.reveal();
    } else {
      const currentPanel = this.createWebviewPanel(item);
      this.panelList.push({
        k: item.k,
        panel: currentPanel,
      });
      currentPanel.onDidDispose(
        () => {
          this.panelList = this.panelList.filter((panel) => panel.k !== item.k);
        },
        null,
        this.context.subscriptions
      );

      currentPanel.webview.postMessage({
        source: 'vsce-postman',
        type: 'receiveData',
        record: item,
        group: this.getGroupData(item),
      });
    }
  };

  getGroupData = (item: TreeItemFile) => {
    let current = item;
    return this.treeDataProvider.records.find(
      (record) => record.k === current.pk
    )!;
  };
}

export function activate(context: vscode.ExtensionContext) {
  new PostmanView(context);
}
