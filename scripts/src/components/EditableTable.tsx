import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Row, Select, Space, Table } from 'antd';
import React from 'react';
import { ParamsDataType } from '../constants';

interface EditableCellProps {
  title?: React.ReactNode;
  dataIndex: string;
  editable?: boolean;
  children?: React.ReactNode;
  record: any;
}

const EditableCell: React.FC<EditableCellProps> = (props) => {
  const { title, editable, children, dataIndex, record, ...restProps } = props;
  let childNode = children;
  const { key, name, disabled, ...restField } = record || {};

  if (editable) {
    let ChildElement: any = Input.TextArea;
    let childProps: any = {
      autoSize: { minRows: 1, maxRows: 4 },
    };
    let formItemProps: any = {};
    if (dataIndex === 'type') {
      ChildElement = Select;
      childProps = {
        style: { width: '100%' },
        options: [
          { label: 'String', value: ParamsDataType.String },
          { label: 'Number', value: ParamsDataType.Number },
        ],
      };
    } else if (dataIndex === 'use') {
      ChildElement = Checkbox;
      formItemProps = {
        valuePropName: 'checked',
      };
    }
    childNode = (
      <Form.Item
        noStyle
        name={[name, dataIndex]}
        {...formItemProps}
        {...restField}
      >
        <ChildElement
          className="editable-form-item"
          bordered={false}
          placeholder={title}
          {...childProps}
          disabled={disabled}
        />
      </Form.Item>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

interface Props {
  type: string;
}
function EditableTable({ type }: Props): React.ReactElement {
  const defaultColumns: (ColumnTypes[number] & {
    editable?: boolean;
    dataIndex: string;
  })[] = [
    {
      dataIndex: 'use',
      editable: true,
      align: 'center',
      width: 30,
    },
    {
      title: '参数名',
      dataIndex: 'name',
      editable: true,
      width: 100,
    },
    {
      title: '参数值',
      dataIndex: 'value',
      editable: true,
      width: 200,
    },
    {
      title: '说明',
      dataIndex: 'description',
      editable: true,
      width: 100,
    },
    {
      dataIndex: 'operation',
      align: 'center',
      width: 30,
      render: (_: any, record: any) => {
        // TODO hover show
        return (
          <Space>
            <Button
              type="text"
              size="small"
              onClick={() => {
                if (record.remove) {
                  record.remove(record.name);
                }
              }}
              disabled={record.disabled}
            >
              <DeleteOutlined />
            </Button>
          </Space>
        );
      },
    },
  ];

  const mergedColumns = defaultColumns.map((col: any) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        type,
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
      }),
    };
  });

  return (
    <div className="editable-table">
      <Table
        size="small"
        columns={mergedColumns as ColumnTypes}
        pagination={false}
        bordered
        className="editable-header-table"
        tableLayout="fixed"
      />

      <Form.List name={['group', type]} initialValue={[]}>
        {(fields) => {
          return (
            <Table
              size="small"
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              showHeader={false}
              rowClassName={() => 'editable-row'}
              dataSource={fields.map((item) => ({ ...item, disabled: true }))}
              columns={mergedColumns as ColumnTypes}
              pagination={false}
              bordered
              tableLayout="fixed"
              className="editable-group-table"
            />
          );
        }}
      </Form.List>
      <Form.List name={type}>
        {(fields, { add, remove }) => {
          return (
            <Table
              size="small"
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              showHeader={false}
              rowClassName={() => 'editable-row'}
              dataSource={fields.map((item) => ({ ...item, remove }))}
              columns={mergedColumns as ColumnTypes}
              pagination={false}
              bordered
              tableLayout="fixed"
              className="editable-content-table"
              footer={() => (
                <Row justify="center">
                  <Button type="link" onClick={() => add({ use: true })}>
                    <PlusCircleOutlined />
                  </Button>
                </Row>
              )}
            />
          );
        }}
      </Form.List>
    </div>
  );
}

export default EditableTable;
