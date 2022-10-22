interface VisibleProps {
  show: boolean;
}

const Visible: React.FC<React.PropsWithChildren<VisibleProps>> = (props) => {
  const { show, children } = props;
  if (!show) return null;

  return children as any;
};

export default Visible;
