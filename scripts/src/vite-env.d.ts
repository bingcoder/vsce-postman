/// <reference types="vite/client" />

declare var webviewVscode: {
  postMessage: (message: Message) => void;
};
