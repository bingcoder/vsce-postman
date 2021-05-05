interface Message {
  type: string;
  value: any
}
declare var webviewVscode: {
  postMessage: (message: Message) => void;
};
