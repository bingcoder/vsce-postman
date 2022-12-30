import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse, Form, Space, Typography } from 'antd';
import { ContentType } from '../constants';
import { handleConfig } from '../utils';

const { Panel } = Collapse;
const { Text } = Typography;

const RequestInfoPart: React.FC<{
  list: Array<{ title: string; value: string }>;
}> = ({ list }) => {
  return (
    <>
      {list.map((item) => (
        <Space key={item.title} style={{ display: 'flex' }}>
          <Text type="secondary">{item.title}:</Text>
          <Text>{item.value}</Text>
        </Space>
      ))}
    </>
  );
};

const panel = [
  'General',
  'Request Headers',
  'Query String Params',
  'Request Payload',
  'Form Data',
];

const getNotNullString = (v?: string, d: string = '') => v ?? d;

const RequestInfo: React.FC = () => {
  const renderPanel = (header: string, content: any, show: boolean = true) => {
    return (
      !!show && (
        <Panel
          header={<Typography.Text strong>{header}</Typography.Text>}
          key={header}
        >
          {content}
        </Panel>
      )
    );
  };
  return (
    <Form.Item shouldUpdate>
      {({ getFieldsValue }) => {
        const value = getFieldsValue();
        const { config } = handleConfig(value);
        // console.log(config, value);
        const { method, baseURL, url, headers, data } = config;
        const searchParams = new URLSearchParams(config.params);
        const queryString = searchParams.toString();
        if (config.auth) {
          const username = config.auth.username || '';
          const password = config.auth.password
            ? unescape(encodeURIComponent(config.auth.password))
            : '';
          headers.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        const showHeader = Object.keys(headers || {}).length > 0;
        const showFormData =
          (!!value[ContentType.FormData] || !!value[ContentType.UrlEncoded]) &&
          Object.keys(data).length > 0;
        const showJsonData =
          !!value[ContentType.JSON] && Object.keys(data).length > 0;
        return (
          <Collapse
            ghost
            collapsible="icon"
            defaultActiveKey={panel}
            expandIcon={({ isActive }) => (
              <CaretRightOutlined rotate={isActive ? 90 : 0} />
            )}
            className="request-info"
          >
            {renderPanel(
              'General',
              <RequestInfoPart
                list={[
                  { title: 'Request Method', value: method },
                  {
                    title: 'Request URL',
                    value: `${getNotNullString(baseURL)}${getNotNullString(
                      url
                    )}${queryString ? '?' : ''}${getNotNullString(
                      queryString
                    )}`,
                  },
                ]}
              />
            )}
            {renderPanel(
              'Request Headers',
              <RequestInfoPart
                list={Object.entries(headers || {}).map((item: any) => ({
                  title: item[0],
                  value: item[1],
                }))}
              />,
              showHeader
            )}
            {renderPanel(
              'Query String Params',
              <RequestInfoPart
                list={[...searchParams.entries()].map((item) => ({
                  title: item[0],
                  value: item[1],
                }))}
              />,
              !!queryString
            )}
            {renderPanel(
              'Request Payload',
              <pre>
                <code>{data}</code>
              </pre>,
              showJsonData
            )}
            {renderPanel(
              'Form Data',
              <RequestInfoPart
                list={Object.entries(data || {}).map((item: any) => ({
                  title: item[0],
                  value: item[1],
                }))}
              />,
              showFormData
            )}
          </Collapse>
        );
      }}
    </Form.Item>
  );
};

export default RequestInfo;
