declare interface HistoryItem {
  name: string;
  url: string;
  method: string;
  headers: any;
  createTime: number;
  updateTime: number;
}
declare interface Message {
  type: string;
  value: any
}