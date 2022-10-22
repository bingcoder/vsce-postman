import { Tabs, TabsProps } from 'antd';
import { ParamsConfigType } from '../constants';
import AuthParams from './AuthParams';
import BodyParams from './BodyParams';
import EditableTable from './EditableTable';
import RequestInfo from './RequestInfo';

const items = [
  {
    label: 'Params',
    key: ParamsConfigType.Params,
    forceRender: true,
    children: <EditableTable type="params" />,
  }, // 务必填写 key
  {
    label: 'Body',
    key: ParamsConfigType.Body,
    forceRender: true,
    children: <BodyParams />,
  },
  {
    label: 'Auth',
    key: ParamsConfigType.Auth,
    forceRender: true,
    children: <AuthParams />,
  },
  {
    label: 'Cookie',
    key: ParamsConfigType.Cookie,
    forceRender: true,
    children: <EditableTable type="cookie" />,
  },
  {
    label: 'Headers',
    key: ParamsConfigType.Header,
    forceRender: true,
    children: <EditableTable type="headers" />,
  },
  {
    label: 'Request',
    key: 'request',
    children: <RequestInfo />,
  },
];

export const settingItems: TabsProps['items'] = [
  {
    label: 'Params',
    key: ParamsConfigType.Params,
    forceRender: true,
    children: <EditableTable type="params" />,
  }, // 务必填写 key
  {
    label: 'Auth',
    key: ParamsConfigType.Auth,
    forceRender: true,
    children: <AuthParams />,
  },
  {
    label: 'Cookie',
    key: ParamsConfigType.Cookie,
    forceRender: true,
    children: <EditableTable type="cookie" />,
  },
  {
    label: 'Headers',
    key: ParamsConfigType.Header,
    forceRender: true,
    children: <EditableTable type="headers" />,
  },
  {
    label: 'Request',
    key: 'request',
    children: <RequestInfo />,
  },
];
const ParamsConfig: React.FC<TabsProps> = (props) => {
  return <Tabs animated items={items} {...props} />;
};

export default ParamsConfig;
