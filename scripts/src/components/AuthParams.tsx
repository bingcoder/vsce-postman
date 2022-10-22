import { InfoCircleOutlined } from '@ant-design/icons';
import { ConfigProvider, Form, Input, Select } from 'antd';
import { AuthType } from '../constants';
import Visible from './Visible';

const AuthorizationTypeOptions = [
  { label: 'Bearer Token', value: AuthType.Bearer },
  { label: 'Basic Auth', value: AuthType.Basic },
];

const formSpan = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

const AuthParams: React.FC = () => {
  const renderContent = (type: AuthType) => {
    switch (type) {
      case AuthType.Basic:
        return (
          <>
            <Form.Item
              label="username"
              name={[AuthType.Basic, 'username']}
              {...formSpan}
            >
              <Input placeholder="username" />
            </Form.Item>
            <Form.Item
              label="password"
              name={[AuthType.Basic, 'password']}
              {...formSpan}
            >
              <Input placeholder="password" />
            </Form.Item>
          </>
        );
      case AuthType.Bearer:
        return (
          <Form.Item label="token" name={AuthType.Bearer} {...formSpan}>
            <Input placeholder="Bearer xxx" />
          </Form.Item>
        );

      default:
        break;
    }
  };
  return (
    <Form.Item noStyle shouldUpdate>
      {({ getFieldValue }) => {
        const groupBasic = getFieldValue(['group', AuthType.Basic]);
        const groupBearer = getFieldValue(['group', AuthType.Bearer]);
        const haveGroupAuth = !!(groupBasic || groupBearer);
        console.log(
          getFieldValue(['group', AuthType.Bearer]),
          getFieldValue(['group', AuthType.Basic])
        );

        return (
          <ConfigProvider componentDisabled={haveGroupAuth}>
            <Form.Item
              label="Authorization Type"
              name="authorizationType"
              {...formSpan}
              tooltip={
                haveGroupAuth
                  ? {
                      title: `来自${getFieldValue('env') || ''}，不可修改`,
                      icon: <InfoCircleOutlined />,
                    }
                  : void 0
              }
            >
              <Select
                options={AuthorizationTypeOptions}
                bordered={false}
                allowClear
                style={{ width: 180 }}
                placeholder="请选择 Authorization Type"
              />
            </Form.Item>

            {renderContent(getFieldValue('authorizationType'))}
            <div style={{ display: 'none' }}>
              <Visible show={!!groupBasic}>
                <Form.Item
                  label="username"
                  name={['group', AuthType.Basic, 'username']}
                  {...formSpan}
                >
                  <Input placeholder="username" />
                </Form.Item>
                <Form.Item
                  label="password"
                  name={['group', AuthType.Basic, 'password']}
                  {...formSpan}
                >
                  <Input placeholder="password" />
                </Form.Item>
              </Visible>
              <Visible show={!!groupBearer}>
                <Form.Item
                  label="token"
                  name={['group', AuthType.Bearer]}
                  {...formSpan}
                >
                  <Input placeholder="Bearer xxx" />
                </Form.Item>
              </Visible>
            </div>
          </ConfigProvider>
        );
      }}
    </Form.Item>
  );
};

export default AuthParams;
