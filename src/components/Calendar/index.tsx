import config, { ICalendarProps } from './Calendar.config';
import { T4DComponent, useEnhancedEditor } from '@ws-ui/webform-editor';
import Build from './Calendar.build';
import Render from './Calendar.render';

const Calendar: T4DComponent<ICalendarProps> = (props) => {
  const { enabled } = useEnhancedEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return enabled ? <Build {...props} /> : <Render {...props} />;
};

Calendar.craft = config.craft;
Calendar.info = config.info;
Calendar.defaultProps = config.defaultProps;

export default Calendar;
