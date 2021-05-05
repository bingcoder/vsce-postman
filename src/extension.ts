import * as vscode from 'vscode';
import { SideProvider } from './provider/side';
import { handlePostmanNew, handleHistoryItemClick, handleHistoryItemNewWindow, handleHistoryItemDelete, handleHistoryRefresh } from './commands/history';

export function activate(context: vscode.ExtensionContext) {
  console.log('start');
  context.subscriptions.push(vscode.window.registerTreeDataProvider('vsc-postman-side', new SideProvider()));

  context.subscriptions.push(vscode.commands.registerCommand('vscPostman.new', handlePostmanNew(context)));
  context.subscriptions.push(vscode.commands.registerCommand('vscPostmanHistory.click', handleHistoryItemClick(context)));
  context.subscriptions.push(vscode.commands.registerCommand('vscPostmanHistory.newWindow', handleHistoryItemNewWindow(context)));
  context.subscriptions.push(vscode.commands.registerCommand('vscPostmanHistory.delete', handleHistoryItemDelete));
  context.subscriptions.push(vscode.commands.registerCommand('vscPostmanHistory.refresh', handleHistoryRefresh));
}