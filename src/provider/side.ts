import * as vscode from 'vscode';

export class SideItem extends vscode.TreeItem {
  constructor(item: HistoryItem) {
    const { method, name, createTime, url } = item;
    super({
      label: `${method[0].toUpperCase()}•${name}`,
    });
    this.id = `${createTime}`;
    this.tooltip = `${method} ${url}`;
    this.command = {
      title: '查看',
      command: 'vscPostmanHistory.click',
      arguments: [item],
    };
  }
}
export class SideProvider implements vscode.TreeDataProvider<HistoryItem> {
  static instance: SideProvider;
  constructor() {
    return SideProvider.instance || (SideProvider.instance = this);
  }
  readonly _onDidChangeTreeData = new vscode.EventEmitter<HistoryItem | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  getTreeItem(item: HistoryItem) {
    return new SideItem(item);
  }
  getChildren() {
    return SideProvider.getHistory()
      .map((item) => JSON.parse(item))
      .sort((a, b) => b.createTime - a.createTime);
  }
  static historyKey = 'vscPostman.history';

  static getHistory(): string[] {
    return vscode.workspace.getConfiguration().get(this.historyKey)!;
  }
  static updateHistory(history: string[]) {
    return this.refresh(() => vscode.workspace.getConfiguration().update(this.historyKey, history, true));
  }

  static deleteHistoryItem(time: number) {
    const newHistory = this.getHistory()
      .filter(item => !item.includes(`${time}`));
    this.updateHistory(newHistory);
  }

  static async refresh(action?: () => void) {
    if (action) {
      await action();
    }
    this.instance._onDidChangeTreeData.fire();
  }
}
