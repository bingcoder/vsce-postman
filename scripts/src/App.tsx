import {
  LoadingOutlined,
  SaveOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  ConfigProvider,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tabs,
  theme,
  Typography,
} from 'antd';
import type { AxiosResponse } from 'axios';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Split from 'react-split';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { ErrorBoundaries } from './components/ErrorBoundaries';
import ParamsConfig from './components/ParamsConfig';
import {
  ResponseDataViewer,
  ResponseHeaderViewer,
} from './components/ResponseViewer';
import Setting from './components/Setting';

import { AuthType, defaultGroupEnv, methods } from './constants';
import { groupEnvState, groupTitleState, settingsOpenState } from './state';
import {
  getAuthorization,
  getAuthorizationType,
  getContentType,
  useFormHandler,
} from './utils';

import 'antd/dist/reset.css';

const App: React.FC = () => {
  const [form] = Form.useForm();
  const getRecordConfig = useFormHandler(form);
  const setSettingsOpen = useSetRecoilState(settingsOpenState);
  const setGroupTitle = useSetRecoilState(groupTitleState);
  const [groupEnv, setGroupEnv] = useRecoilState(groupEnvState);

  const [response, setResponse] = useState<
    (AxiosResponse & { spend: number }) | null
  >(null);
  const [requestId, setRequestId] = useState(0);
  const [canCancel, setCanCancel] = useState(false);
  const currentRecord = useRef<{ k: string }>();

  const env = Form.useWatch('env', form);

  // const values = Form.useWatch([], form);
  // console.log('form values Changed', values);

  useEffect(() => {
    // data-vscode-theme-kind  vscode-dark light
    // document.body.dataset.theme = theme;
    // document.body.dataset.vscodeThemeKind = 'vscode-dark';
  }, [theme]);

  useEffect(() => {
    const group =
      groupEnv?.find((item) => item.title === env) || defaultGroupEnv;
    // form.resetFields([
    //   ['group', AuthType.Basic],
    //   ['group', AuthType.Bearer],
    // ]);
    const authorization = getAuthorization(group, currentRecord.current);
    console.log(authorization);
    form.resetFields(['group']);
    form.setFieldsValue({
      group,
      ...authorization,
      authorizationType: getAuthorizationType(authorization),
      baseURL: group?.baseURL || '',
    });
  }, [env, groupEnv]);

  const handleReceiveResponseFromRequest = (data: any) => {
    const { value } = data;
    console.log(value.requestId, requestId, value.requestId === requestId);
    if (value.requestId !== requestId) return;
    setResponse(value);
    setRequestId(0);
  };

  const handleReceiveData = (data: any) => {
    const { record, group } = data;
    currentRecord.current = record;
    if (group?.env) {
      setGroupEnv(group.env);
    }
    if (group?.title) {
      setGroupTitle(group.title);
    }
    form.setFieldsValue({
      ...record,
      authorizationType: getAuthorizationType(record),
      contentType: getContentType(record),
    });
  };

  const receiveMessageHandler = {
    response: handleReceiveResponseFromRequest,
    receiveData: handleReceiveData,
  };

  const handleReceiveMessageFromVscode = (event: MessageEvent) => {
    try {
      const { source, type } = event.data;
      if (source !== 'vsce-postman') return;
      receiveMessageHandler[type as keyof typeof receiveMessageHandler](
        event.data
      );
    } catch (error) {
      console.log(error);
    }
  };

  // TODO 开发环境
  useEffect(() => {
    if (import.meta.env.DEV) {
      window.webviewVscode = {
        postMessage(v) {
          console.dir(v.value);
        },
      };
      setTimeout(() => {
        receiveMessageHandler.receiveData({
          record: {
            k: '1666439047206',
            ft: 1,
            title: '1',
            pk: '1666439042548',
            formData: [
              {
                use: true,
                name: '1',
                value: '1',
              },
            ],
            bearerToken: 'xxxxx1',
            // auth: {
            //   username: 'NAME',
            //   password: 'pass',
            // },
            // params: [{ use: true, name: '2', value: '2', description: '2' }],
            // cookie: [{ use: true, name: 'c', value: 'c', description: 'c' }],
          },
          group: {
            k: '1666439042548',
            ft: 2,
            title: '2',
            pk: null,
            env: [
              {
                title: '测试环境',
                baseURL: 'http://127.0.0.1:5500',
                // bearerToken: 'xxxxx',
                auth: {
                  username: 'NAME',
                  password: 'pass',
                },
                params: [
                  { use: true, name: '1', value: '1', description: '1' },
                  { use: true, name: '11', value: '11', description: '11' },
                ],
                cookie: [
                  { use: true, name: 'c', value: 'c', description: 'c' },
                  { use: true, name: 'cc', value: 'cc', description: 'cc' },
                ],
                headers: [
                  { use: true, name: 'h', value: 'h', description: 'h' },
                  { use: true, name: 'hh', value: 'hh', description: 'hh' },
                ],
              },
              {
                title: '测试环境3',
                baseURL: 'http://127.0.0.3',
                bearerToken: 'Bearer xxxxx',
                params: [
                  { use: true, name: '2', value: '2', description: '2' },
                ],
                cookie: [],
                headers: [],
              },
              {
                title: '测试环境4',
                baseURL: 'http://127.0.0.3',
                params: [],
                cookie: [],
                headers: [],
              },
            ],
          },
        });
      }, 1000);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleReceiveMessageFromVscode);
    return () => {
      window.removeEventListener('message', handleReceiveMessageFromVscode);
    };
  }, [requestId]);

  const handleSubmit = async () => {
    if (requestId) return;
    setResponse(null);
    const _requestId = +new Date();
    setRequestId(_requestId);
    const { config } = await getRecordConfig();

    webviewVscode.postMessage({
      type: 'request',
      value: {
        requestId: _requestId,
        k: currentRecord.current?.k,
        ...config,
      },
    });

    setTimeout(() => {
      setCanCancel(true);
    }, 1000);
  };

  const handleSave = async () => {
    const { record } = await getRecordConfig();
    const value = {
      k: currentRecord.current?.k,
      ...getAuthorization(currentRecord.current),
      ...record,
    };
    // 删除baseURL只从env里获取
    delete value.baseURL;
    webviewVscode.postMessage({
      type: 'saveRecord',
      value,
    });
    currentRecord.current = value;
  };

  const handleCancel = () => {
    setRequestId(0);
    setCanCancel(false);
  };

  const handleToggleSettingsOpen = () => {
    setSettingsOpen((x) => !x);
  };

  const handleStopPropagation: React.MouseEventHandler = (e) => {
    e.stopPropagation();
  };

  const envOptions = useMemo(() => {
    return groupEnv?.map((item) => ({
      label: item.title,
      value: item.title,
    }));
  }, [groupEnv]);

  return (
    <ConfigProvider theme={{ algorithm: [theme.darkAlgorithm] }}>
      <Split
        className="split"
        direction="vertical"
        gutterSize={4}
        sizes={JSON.parse(localStorage.getItem('splitSizes') || '[50, 50]')}
        onDragEnd={(s) => {
          localStorage.setItem('splitSizes', JSON.stringify(s));
        }}
      >
        <Form form={form} preserve={false} className="postman-form">
          <ErrorBoundaries>
            <Row wrap={false}>
              <Col flex={1}>
                <Form.Item name="url">
                  <Input
                    addonBefore={
                      <Form.Item name="method" noStyle initialValue="GET">
                        <Select
                          options={methods.map((method) => ({
                            label: method,
                            value: method,
                          }))}
                          style={{ width: 100 }}
                        />
                      </Form.Item>
                    }
                    prefix={
                      <>
                        <Form.Item name="env" noStyle>
                          <Select
                            size="small"
                            allowClear
                            showArrow={false}
                            bordered={false}
                            style={{ minWidth: 60, marginRight: 0 }}
                            dropdownMatchSelectWidth={false}
                            placeholder="请选择环境"
                            onClick={handleStopPropagation}
                            options={envOptions}
                          />
                        </Form.Item>
                        <Form.Item
                          noStyle
                          name="baseURL"
                          valuePropName="children"
                        >
                          <span onClick={handleStopPropagation} />
                        </Form.Item>
                      </>
                    }
                    placeholder='请输入地址以"/"开始'
                  />
                </Form.Item>
              </Col>
              <Col style={{ marginLeft: 16 }}>
                <Space.Compact>
                  <Button
                    type="primary"
                    style={{
                      cursor:
                        !!requestId && !canCancel ? 'not-allowed' : 'pointer',
                    }}
                    onClick={
                      requestId && canCancel ? handleCancel : handleSubmit
                    }
                  >
                    {requestId ? (
                      <>
                        <LoadingOutlined /> 取消
                      </>
                    ) : (
                      <>
                        <SearchOutlined /> 发送
                      </>
                    )}
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                  />
                </Space.Compact>
              </Col>
            </Row>
            <ParamsConfig
              tabBarExtraContent={
                groupEnv ? (
                  <Button type="text" onClick={handleToggleSettingsOpen}>
                    <SettingOutlined />
                  </Button>
                ) : undefined
              }
            />
          </ErrorBoundaries>
        </Form>
        <Tabs
          className="response"
          tabBarExtraContent={{
            right: (
              <Space>
                <div>
                  Status：
                  <Typography.Text type="success">
                    {response?.status} {response?.statusText}
                  </Typography.Text>
                </div>
                <div>
                  Time：
                  <Typography.Text>
                    {`${response?.spend || '-'} ms`}
                  </Typography.Text>
                </div>
              </Space>
            ),
          }}
          items={[
            {
              label: 'Body',
              key: 'body',
              children: (
                <ErrorBoundaries>
                  <ResponseDataViewer response={response} />
                </ErrorBoundaries>
              ),
            },
            {
              label: 'Headers',
              key: 'headers',
              children: (
                <ErrorBoundaries>
                  <ResponseHeaderViewer data={response?.headers} />
                </ErrorBoundaries>
              ),
            },
          ]}
        />
      </Split>
      <Setting env={env} />
    </ConfigProvider>
  );
};

export default App;
