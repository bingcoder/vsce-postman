/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");;

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SideProvider = exports.SideItem = void 0;
const vscode = __webpack_require__(1);
class SideItem extends vscode.TreeItem {
    constructor(item) {
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
exports.SideItem = SideItem;
class SideProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        return SideProvider.instance || (SideProvider.instance = this);
    }
    getTreeItem(item) {
        return new SideItem(item);
    }
    getChildren() {
        return SideProvider.getHistory()
            .map((item) => JSON.parse(item))
            .sort((a, b) => b.createTime - a.createTime);
    }
    static getHistory() {
        return vscode.workspace.getConfiguration().get(this.historyKey);
    }
    static updateHistory(history) {
        return this.refresh(() => vscode.workspace.getConfiguration().update(this.historyKey, history, true));
    }
    static deleteHistoryItem(time) {
        const newHistory = this.getHistory()
            .filter(item => !item.includes(`${time}`));
        this.updateHistory(newHistory);
    }
    static refresh(action) {
        return __awaiter(this, void 0, void 0, function* () {
            if (action) {
                yield action();
            }
            this.instance._onDidChangeTreeData.fire();
        });
    }
}
exports.SideProvider = SideProvider;
SideProvider.historyKey = 'vscPostman.history';


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.handleHistoryRefresh = exports.handleHistoryItemDelete = exports.handleHistoryItemNewWindow = exports.handleHistoryItemClick = exports.handlePostmanNew = void 0;
const vscode = __webpack_require__(1);
const path = __webpack_require__(4);
const side_1 = __webpack_require__(2);
const settingKey = 'vscPostman.history';
const createWebviewPanel = (context, { id = 'vscPostman', title = '新建请求', } = {}) => {
    const columnToShowIn = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : vscode.ViewColumn.One;
    const panel = vscode.window.createWebviewPanel(id, title, columnToShowIn, {
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
    panel.webview.onDidReceiveMessage((message) => {
        switch (message.type) {
            case 'requestSave':
                const history = side_1.SideProvider.getHistory();
                history.push(message.value);
                side_1.SideProvider.updateHistory(history);
                return;
            default:
                break;
        }
    });
    const script = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'build/bundle.js')));
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
const handlePostmanNew = (context) => () => {
    createWebviewPanel(context);
};
exports.handlePostmanNew = handlePostmanNew;
const handleHistoryItemClick = (context) => {
    let currentPanel = undefined;
    return (item) => {
        if (currentPanel) {
            currentPanel.reveal();
        }
        else {
            currentPanel = createWebviewPanel(context);
        }
        currentPanel.title = item.name;
        console.log(item.name);
        currentPanel.webview.postMessage(item);
        currentPanel.onDidDispose(() => {
            currentPanel = undefined;
        }, null, context.subscriptions);
    };
};
exports.handleHistoryItemClick = handleHistoryItemClick;
const handleHistoryItemNewWindow = (context) => (item) => {
    const currentPanel = createWebviewPanel(context);
    currentPanel.title = item.name;
    currentPanel.webview.postMessage(item);
};
exports.handleHistoryItemNewWindow = handleHistoryItemNewWindow;
const handleHistoryItemDelete = ({ createTime, }) => {
    side_1.SideProvider.deleteHistoryItem(createTime);
};
exports.handleHistoryItemDelete = handleHistoryItemDelete;
const handleHistoryRefresh = () => {
    side_1.SideProvider.refresh();
};
exports.handleHistoryRefresh = handleHistoryRefresh;


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("path");;

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = void 0;
const vscode = __webpack_require__(1);
const side_1 = __webpack_require__(2);
const history_1 = __webpack_require__(3);
function activate(context) {
    console.log('start');
    context.subscriptions.push(vscode.window.registerTreeDataProvider('vsc-postman-side', new side_1.SideProvider()));
    context.subscriptions.push(vscode.commands.registerCommand('vscPostman.new', history_1.handlePostmanNew(context)));
    context.subscriptions.push(vscode.commands.registerCommand('vscPostmanHistory.click', history_1.handleHistoryItemClick(context)));
    context.subscriptions.push(vscode.commands.registerCommand('vscPostmanHistory.newWindow', history_1.handleHistoryItemNewWindow(context)));
    context.subscriptions.push(vscode.commands.registerCommand('vscPostmanHistory.delete', history_1.handleHistoryItemDelete));
    context.subscriptions.push(vscode.commands.registerCommand('vscPostmanHistory.refresh', history_1.handleHistoryRefresh));
}
exports.activate = activate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map