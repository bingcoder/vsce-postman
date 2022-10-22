import { Form } from 'antd';
import { Component, createRef } from 'react';
import { ContentType } from '../constants';

interface JsonEditorProps {
  value?: any;
  onChange?: any;
}

class JsonEditor extends Component<JsonEditorProps> {
  domRef = createRef<HTMLDivElement>();
  editor: any;
  componentDidMount(): void {
    const { value } = this.props;
    // @ts-ignore
    this.editor = monaco.editor.create(this.domRef.current, {
      value: value,
      language: 'json',
      theme: 'vs-dark',
      fontSize: '16px',
      tabSize: 2,
      automaticLayout: true,
      scrollbar: {
        vertical: 'hidden',
      },
      minimap: {
        enabled: false,
      },
    });

    this.editor.onDidPaste(() => {
      this.editor.getAction('editor.action.formatDocument')._run();
    });
    this.editor.onDidChangeModelContent(() => {
      this.props.onChange(this.editor.getValue());
    });
    this.editor.addAction({
      id: 'editor.action.formatDocument',
      label: 'Format Document',
      keybindings: [
        window.monaco.KeyMod.Shift |
          window.monaco.KeyMod.Alt |
          window.monaco.KeyCode.KeyF,
      ],
      contextMenuGroupId: '1_modification',
      contextMenuOrder: 1.3,
      run: () => {
        const formatCode = window.prettier.format(this.editor.getValue(), {
          parser: 'json-stringify',
          plugins: window.prettierPlugins,
        });
        this.editor.executeEdits('beautifier', [
          {
            identifier: 'delete',
            range: new window.monaco.Range(1, 1, 10000, 1),
            text: '',
            forceMoveMarkers: true,
          },
        ]);
        this.editor.executeEdits('beautifier', [
          {
            identifier: 'insert',
            range: new window.monaco.Range(1, 1, 1, 1),
            text: formatCode,
            forceMoveMarkers: true,
          },
        ]);
      },
    });
  }

  componentWillUnmount(): void {
    this.editor.dispose();
  }

  componentDidUpdate(): void {
    if (this.props.value !== this.editor.getValue()) {
      this.editor.setValue(this.props.value || '{\r\n  \r\n}');
    }
  }

  render() {
    return (
      <div
        className={`json-editor`}
        ref={this.domRef}
        style={{ height: 200 }}
      />
    );
  }
}

const JsonEditorFormItem = () => (
  <Form.Item
    name={ContentType.JSON}
    initialValue={`{

}`}
    rules={[
      { required: true, message: '请输入' },
      {
        validator(r, v) {
          try {
            JSON.parse(v);
            return Promise.resolve();
          } catch (error) {
            return Promise.reject('请输入正确的json');
          }
        },
      },
    ]}
  >
    <JsonEditor />
  </Form.Item>
);

export default JsonEditorFormItem;
