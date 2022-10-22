import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Col,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Input,
  Row,
  Space,
  Tooltip,
} from 'antd';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { groupEnvState, groupTitleState, settingsOpenState } from '../state';
import { Env } from '../type';
import { getAuthorizationType, useFormHandler } from '../utils';
import ParamsConfig, { settingItems } from './ParamsConfig';
import Visible from './Visible';

interface ConfigProps {
  env: string;
  setDisableSave: any;
}

const Config = forwardRef((props: ConfigProps, ref) => {
  const { env, setDisableSave } = props;

  const [form] = Form.useForm();
  const getRecordConfig = useFormHandler(form);
  const [settingsOpen, setSettingsOpen] = useRecoilState(settingsOpenState);
  const groupTitle = useRecoilValue(groupTitleState);
  const [groupEnv, setGroupEnv] = useRecoilState(groupEnvState);

  const [currentEnv, setCurrentEnv] = useState<Env | null>();
  const [currentGroupEnv, setCurrentGroupEnv] = useState<Env[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useImperativeHandle(ref, () => ({
    saveEnv() {
      setGroupEnv(currentGroupEnv);
      webviewVscode.postMessage({
        type: 'saveGroupEnv',
        value: {
          title: groupTitle,
          env: currentGroupEnv,
        },
      });
      setSettingsOpen(false);
    },
  }));

  useEffect(() => {
    setCurrentGroupEnv([]);
    setIsAdding(false);
    setIsEditing(false);
    if (Array.isArray(groupEnv) && groupEnv.length) {
      setCurrentGroupEnv(groupEnv);
      // TODO
      let defaultEnv;
      if (env) {
        defaultEnv = groupEnv.find((item) => item.title === env);
      }
      setCurrentEnv(defaultEnv || groupEnv[0]);
    } else {
      form.resetFields();
      setCurrentEnv(null);
    }
  }, [groupEnv]);

  useEffect(() => {
    form.setFieldsValue({
      ...currentEnv,
      authorizationType: getAuthorizationType(currentEnv),
    });
  }, [currentEnv]);

  useEffect(() => {
    setDisableSave(isAdding || isEditing);
  }, [isAdding, isEditing]);

  const handleEditEnv = (env: Env) => {
    setIsEditing(true);
    setCurrentEnv(env);
  };

  const handleCancelEditEnv = (env: Env) => {
    setIsEditing(false);
    setCurrentEnv(env);
    form.setFieldsValue(env);
  };

  const handleConfirmEditEnv = async (env: Env) => {
    const { record } = await getRecordConfig();
    setCurrentGroupEnv((v) => {
      const newGroupEnv = [...v];
      const index = newGroupEnv.findIndex((item) => item === env);
      if (index > -1) {
        newGroupEnv[index] = record;
      }
      return newGroupEnv;
    });
    setCurrentEnv(record);
    setIsEditing(false);
  };

  const handleAddEnv = () => {
    setIsAdding(true);
    form.resetFields();
  };

  const handleCancelAddEnv = () => {
    setIsAdding(false);
    if (currentEnv) {
      setCurrentEnv(currentEnv);
    }
  };

  const handleConfirmAddEnv = async () => {
    const { record } = await getRecordConfig();
    setCurrentGroupEnv((x) => [...x, record]);
    setCurrentEnv(record);
    setIsAdding(false);
  };

  const handleChangeEnv = (env: Env) => {
    setCurrentEnv(env);
  };

  const handleDeleteEnv = (env: Env) => {
    const newEnvList = currentGroupEnv.filter((item) => item !== env);
    setCurrentGroupEnv(newEnvList);
    if (currentEnv === env) {
      if (newEnvList.length) {
        setCurrentEnv(newEnvList[0]);
      } else {
        form.resetFields();
      }
    }
  };

  const formVisitable = currentGroupEnv.length || isAdding;
  const formDisabled = !isAdding && !isEditing;

  const isEditingEnv = (env: Env) => isEditing && currentEnv === env;

  const isCanEditEnv = (env: Env) =>
    isAdding || (isEditing && currentEnv !== env);
  return (
    <>
      <Visible show={!!errorMessage}>
        <Alert
          message={errorMessage}
          type="error"
          showIcon
          closable
          onClose={() => {
            setErrorMessage('');
          }}
          style={{ marginBottom: 16 }}
        />
      </Visible>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {currentGroupEnv.map((env) => (
          <Col key={env.title}>
            <Visible show={!isEditingEnv(env)}>
              <Space.Compact>
                <Button
                  className="env"
                  type={currentEnv === env ? 'primary' : 'default'}
                  onClick={() => handleChangeEnv(env)}
                  disabled={isCanEditEnv(env)}
                >
                  {env.title}
                </Button>
                <Dropdown
                  disabled={isCanEditEnv(env)}
                  menu={{
                    items: [
                      {
                        key: 'edit',
                        icon: <EditOutlined />,
                        label: '编辑',
                      },
                      {
                        key: 'delete',
                        icon: <CloseOutlined />,
                        label: '删除',
                      },
                    ],
                    onClick: (e) => {
                      const handler = {
                        edit: handleEditEnv,
                        delete: handleDeleteEnv,
                      };
                      handler[e.key as 'edit' | 'delete']?.(env);
                    },
                  }}
                >
                  <Button
                    type={currentEnv === env ? 'primary' : 'default'}
                    icon={<EllipsisOutlined />}
                  />
                </Dropdown>
              </Space.Compact>
            </Visible>

            <Visible show={isEditingEnv(env)}>
              <Space.Compact>
                <Button
                  className="env"
                  type={currentEnv === env ? 'primary' : 'default'}
                  onClick={() => handleChangeEnv(env)}
                  disabled={isAdding}
                >
                  {env.title}
                </Button>
                <Button
                  type="primary"
                  icon={<CloseOutlined />}
                  onClick={() => handleCancelEditEnv(env)}
                />
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleConfirmEditEnv(env)}
                />
              </Space.Compact>
            </Visible>
          </Col>
        ))}
        <Visible show={!isAdding && !isEditing}>
          <Button type="link" onClick={handleAddEnv} icon={<PlusOutlined />} />
        </Visible>
        <Visible show={isAdding && !isEditing}>
          <Space>
            <Button
              type="link"
              icon={<CloseOutlined />}
              onClick={handleCancelAddEnv}
            />
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={handleConfirmAddEnv}
            />
          </Space>
        </Visible>
      </Row>
      <Visible show={!!formVisitable}>
        <Form
          form={form}
          requiredMark={false}
          preserve={false}
          disabled={formDisabled}
        >
          <Form.Item
            label="环境名称"
            name="title"
            rules={[
              {
                required: true,
                whitespace: true,
                message: '请输入环境名称',
              },
              {
                validator(r, value) {
                  const title = value?.trim();
                  if (isAdding) {
                    if (currentGroupEnv.find((item) => item.title === title)) {
                      return Promise.reject('环境名称不可以重复');
                    }
                  } else if (isEditing) {
                    if (
                      currentGroupEnv.find(
                        (item) => item !== currentEnv && item.title === title
                      )
                    ) {
                      return Promise.reject('环境名称不可以重复');
                    }
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input bordered={false} placeholder="请输入环境名称" />
          </Form.Item>
          <Form.Item label="baseURL" name="baseURL">
            <Input bordered={false} placeholder="请输入baseURL" />
          </Form.Item>

          <ParamsConfig items={settingItems} />
        </Form>
      </Visible>
      <Visible show={!formVisitable}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Visible>
    </>
  );
});

const Setting: React.FC<{ env: string }> = ({ env }) => {
  const [settingsOpen, setSettingsOpen] = useRecoilState(settingsOpenState);
  const groupTitle = useRecoilValue(groupTitleState);

  const configRef: any = useRef();

  const [disableSave, setDisableSave] = useState(false);

  const handleToggleSettingsOpen = () => {
    setSettingsOpen((x) => !x);
  };

  const handleSave = () => {
    configRef.current?.saveEnv();
  };

  return (
    <Drawer
      size="large"
      open={settingsOpen}
      closable={false}
      maskClosable={false}
      destroyOnClose
      onClose={handleToggleSettingsOpen}
      className="group-setting"
      title={
        <Space>
          <span>{groupTitle}</span>
          <Tooltip
            title={`${groupTitle}环境配置，适用于${groupTitle}下所有请求`}
          >
            <ExclamationCircleOutlined />
          </Tooltip>
        </Space>
      }
      extra={
        <Space>
          <Button onClick={handleToggleSettingsOpen}>取消</Button>
          <Button type="primary" disabled={disableSave} onClick={handleSave}>
            保存
          </Button>
        </Space>
      }
    >
      <Config ref={configRef} setDisableSave={setDisableSave} env={env} />
    </Drawer>
  );
};

export default Setting;
