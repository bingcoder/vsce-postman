import * as vscode from 'vscode';
import * as path from 'path';
import { SideProvider } from '../provider/side';

const settingKey = 'vscPostman.history';
const createWebviewPanel = (
  context: vscode.ExtensionContext,
  {
    id = 'vscPostman',
    title = '新建请求',
  }: { id?: string; title?: string } = {}
) => {
  const columnToShowIn = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.viewColumn
    : vscode.ViewColumn.One;
  const panel = vscode.window.createWebviewPanel(id, title, columnToShowIn!, {
    enableScripts: true,
    localResourceRoots: [
      vscode.Uri.file(path.join(context.extensionPath, 'media')),
      vscode.Uri.file(path.join(context.extensionPath, 'build')),
    ],
    retainContextWhenHidden: true,
  });

  panel.iconPath = {
    light: vscode.Uri.file(path.join(context.extensionPath, 'media/panelIcon.light.svg')),
    dark: vscode.Uri.file(path.join(context.extensionPath, 'media/panelIcon.dark.svg')),
  };

  panel.webview.onDidReceiveMessage((message: Message) => {
    switch (message.type) {
      case 'requestSave':
        const history = SideProvider.getHistory();
        history.push(message.value);
        SideProvider.updateHistory(history);
        return;

      default:
        break;
    }
  });

  const script = panel.webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, 'build/bundle.js'))
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
      <script src=${script}></script>
    </body>
  </html>`;
  return panel;
};

export const handlePostmanNew = (context: vscode.ExtensionContext) => () => {
  createWebviewPanel(context);
};

export const handleHistoryItemClick = (context: vscode.ExtensionContext) => {
  let currentPanel: vscode.WebviewPanel | undefined = undefined;
  return (item: HistoryItem) => {
    if (currentPanel) {
      currentPanel.reveal();
    } else {
      currentPanel = createWebviewPanel(context);
    }
    currentPanel.title = item.name;
    console.log(item.name);
    currentPanel.webview.postMessage(item);
    currentPanel.onDidDispose(
      () => {
        currentPanel = undefined;
      },
      null,
      context.subscriptions
    );
  };
};

export const handleHistoryItemNewWindow = (
  context: vscode.ExtensionContext
) => (item: HistoryItem) => {
  const currentPanel = createWebviewPanel(context);
  currentPanel.title = item.name;
  currentPanel.webview.postMessage(item);

};

export const handleHistoryItemDelete = ({
  createTime,
}: HistoryItem) => {
  SideProvider.deleteHistoryItem(createTime);
};
export const handleHistoryRefresh = () => {
  SideProvider.refresh();
};
