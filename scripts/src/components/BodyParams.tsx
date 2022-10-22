import { Form, Select } from 'antd';
import { ContentType } from '../constants';
import EditableTable from './EditableTable';
import JsonEditor from './JsonEditor';

const ContentTypeOptions = [
  { label: 'multipart/form-data', value: ContentType.FormData },
  { label: 'application/x-www-form-urlencoded', value: ContentType.UrlEncoded },
  { label: 'application/json', value: ContentType.JSON },
];

const BodyParams: React.FC = () => {
  const renderContent = (type: ContentType) => {
    switch (type) {
      case ContentType.FormData:
        return <EditableTable type={ContentType.FormData} />;
      case ContentType.UrlEncoded:
        return <EditableTable type={ContentType.UrlEncoded} />;

      case ContentType.JSON:
        return <JsonEditor />;
      default:
        break;
    }
  };
  return (
    <>
      <Form.Item
        label="Content Type"
        name="contentType"
        style={{ marginBottom: 10 }}
      >
        <Select
          options={ContentTypeOptions}
          bordered={false}
          style={{ width: 270 }}
          allowClear
          placeholder="请选择 Content Type"
        />
      </Form.Item>

      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => renderContent(getFieldValue('contentType'))}
      </Form.Item>
    </>
  );
};

export default BodyParams;
