import { SearchOutlined, SaveOutlined } from '@ant-design/icons';
import { Input, Select, Space, Button, Tabs, Row, Col, Form } from 'antd';
import { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import ReactJsonView from 'react-json-view';

const { Option } = Select;
const { TabPane } = Tabs;

const request = axios.create({
  timeout: 60000,
  validateStatus: (status) => status >= 200,
});
request.defaults.headers['Content-Type'] = 'application/json';

const FormItem: React.FC<{ name: string }> = ({ name, children }) => {
  return (
    <Form.Item
      name={name}
      rules={[
        {
          validator: (_, v) => {
            if (v === undefined) {
              return Promise.resolve();
            }
            try {
              const parseValue = JSON.parse(v);
              if (Object.prototype.toString.call(parseValue) === '[object Object]') {
                console.log(v);
                return Promise.resolve();
              }
            } catch (error) {}
            return Promise.reject(`'${name}' is JSON object`);
          },
        },
      ]}
    >
      {children}
    </Form.Item>
  );
};

const defaultResult: any = {};

function App() {
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(0);
  const [result, setResult] = useState<AxiosResponse<any>>(defaultResult);
  const [form] = Form.useForm();

  const handleReceiveMessageFromVscode = (event: any) => {
    console.log(event.data);
    form.setFieldsValue(event.data);
  };

  useEffect(() => {
    console.log('message1');
    window.addEventListener('message', handleReceiveMessageFromVscode);
    return () => {
      form.resetFields();
      window.removeEventListener('message', handleReceiveMessageFromVscode);
    };
  }, []);

  const handleSubmit = (value: any) => {
    const { method, url, headers, body } = value;
    setLoading(true);
    setTime(0);
    setResult(defaultResult);
    const startTime = +new Date();
    request({
      url,
      method,
      headers: headers && JSON.parse(headers),
      data: body,
      params: method === 'get' && body ? JSON.parse(body) : undefined,
    })
      .then((res) => {
        console.log(res);
        setResult(res);
        setTime(+new Date() - startTime);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSave = () => {
    form.validateFields().then((res) => {
      webviewVscode.postMessage({
        type: 'requestSave',
        value: JSON.stringify({
          ...res,
          createTime: +new Date(),
        }),
      });
    });
  };
  return (
    <div>
      <Form form={form} initialValues={{ method: 'GET' }} onFinish={handleSubmit}>
        <Form.Item name="name" rules={[{ required: true }, { type: 'string', max: 20 }]}>
          <Input
            style={{
              marginTop: 20,
              width: '30%',
              boxShadow: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
            }}
            placeholder="请输入名称"
          />
        </Form.Item>
        <Form.Item name="url" rules={[{ required: true }]}>
          <Input
            addonBefore={
              <Form.Item name="method" noStyle>
                <Select>
                  <Option value="GET">GET</Option>
                  <Option value="POST">POST</Option>
                  <Option value="DELETE">DELETE</Option>
                  <Option value="PUT">PUT</Option>
                  <Option value="PATCH">PATCH</Option>
                </Select>
              </Form.Item>
            }
            placeholder="请输入地址"
          />
        </Form.Item>
        <Tabs>
          <TabPane tab="Headers" key="headers">
            <FormItem name="headers">
              <Input.TextArea
                placeholder={`{\r\n "Content-Type": "application/json; charset=UTF-8"\r\n}`}
                rows={5}
              />
            </FormItem>
          </TabPane>
          <TabPane tab="Body" key="body">
            <FormItem name="body">
              <Input.TextArea placeholder={`{\r\n "name": "john"\r\n}`} rows={5} />
            </FormItem>
          </TabPane>
        </Tabs>
      </Form>

      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={22}>
          <Button
            style={{ width: '100%' }}
            type="primary"
            loading={loading}
            icon={<SearchOutlined />}
            onClick={form.submit}
          />
        </Col>
        <Col span={2}>
          <Button
            style={{ width: '100%' }}
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
          />
        </Col>
      </Row>

      <Tabs
        tabBarExtraContent={{
          right: (
            <Space>
              <div>
                Status:
                <Button type="link" style={{ padding: '4px 10px' }}>
                  {result.status} {result.statusText}
                </Button>
              </div>
              <div>
                Time:
                <Button type="link" style={{ padding: '4px 10px' }}>
                  {time ? `${time} ms` : ' '}
                </Button>
              </div>
            </Space>
          ),
        }}
      >
        <TabPane tab="Body" key="body">
          {typeof result.data === 'object' ? (
            <ReactJsonView
              theme="ocean"
              style={{ background: 'transparent' }}
              src={result.data}
              collapsed={false}
              collapseStringsAfterLength={false}
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={false}
            />
          ) : (
            result.data
          )}
        </TabPane>
        <TabPane tab="Headers" key="headers">
          {result.headers && (
            <ReactJsonView
              theme="ocean"
              style={{ background: 'transparent' }}
              src={result.headers}
              collapsed={false}
              collapseStringsAfterLength={false}
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={false}
            />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
}

export default App;
