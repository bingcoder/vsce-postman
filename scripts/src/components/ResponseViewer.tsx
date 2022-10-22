import { Empty } from 'antd';
import type { AxiosResponse } from 'axios';
import { useEffect, useRef } from 'react';

interface ResponseViewerProps {
  response: AxiosResponse | null;
}

const editorTypeMap = {
  'text/css': 'css',
  'text/html': 'html',
  'application/json': 'json',
  'application/javascript': 'javascript',
} as const;

type Language = typeof editorTypeMap[keyof typeof editorTypeMap];

export const ResponseDataViewer: React.FC<ResponseViewerProps> = ({
  response,
}) => {
  const domRef: any = useRef();
  const editor = useRef<any>();
  useEffect(() => {
    if (domRef.current) {
      const getLanguageFromResponse = () => {
        const responseContentType = response?.headers?.['content-type'];
        if (responseContentType) {
          const contentType = Object.keys(editorTypeMap).find((item) =>
            responseContentType.includes(item)
          );
          return editorTypeMap[contentType as keyof typeof editorTypeMap];
        }
      };
      const getValueFromResponse = (language?: Language) => {
        try {
          switch (language) {
            // case 'css':
            // case 'html':
            // case 'javascript':
            //   return response?.data;
            case 'json':
              return JSON.stringify(response?.data, null, 2);
            default:
              return response?.data;
          }
        } catch (error) {
          console.log(error);
          return '';
        }
      };
      const language = getLanguageFromResponse();
      const value = getValueFromResponse(language) || '';
      // @ts-ignore
      editor.current = monaco.editor.create(domRef.current, {
        value,
        language,
        theme: 'vs-dark',
        fontSize: '16px',
        tabSize: 2,
        automaticLayout: true,
        minimap: {
          enabled: false,
        },
      });
    }
    return () => {
      editor.current?.dispose();
    };
  }, [response]);
  return response ? (
    <div className="response-viewer" ref={domRef!} style={{ height: '100%' }} />
  ) : (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
  );
};

interface ResponseHeaderViewerProps {
  data?: AxiosResponse['headers'];
}

export const ResponseHeaderViewer: React.FC<ResponseHeaderViewerProps> = ({
  data,
}) => {
  const domRef: any = useRef();
  const editor = useRef<any>();
  useEffect(() => {
    if (domRef.current) {
      const getValueFromResponse = () => {
        try {
          return JSON.stringify(data, null, 2);
        } catch (error) {
          return '';
        }
      };
      const value = getValueFromResponse() || '';
      if (editor.current) {
        editor.current.setValue(value);
      } else {
        editor.current = window.monaco.editor.create(domRef.current, {
          value,
          language: 'json',
          theme: 'vs-dark',
          fontSize: '16px',
          tabSize: 2,
          automaticLayout: true,
          minimap: {
            enabled: false,
          },
        });
      }
    }
  }, [data]);

  useEffect(() => {
    return () => {
      editor.current?.dispose();
    };
  }, []);
  return data ? (
    <div className="response-viewer" ref={domRef!} style={{ height: '100%' }} />
  ) : (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
  );
};
