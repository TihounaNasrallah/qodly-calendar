import config, { IDayViewProps } from './DayView.config';
import { T4DComponent, useEnhancedEditor } from '@ws-ui/webform-editor';
import Build from './DayView.build';
import Render from './DayView.render';

const DayView: T4DComponent<IDayViewProps> = (props) => {
  const { enabled } = useEnhancedEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return enabled ? <Build {...props} /> : <Render {...props} />;
};

DayView.craft = config.craft;
DayView.info = config.info;
DayView.defaultProps = config.defaultProps;

export default DayView;
