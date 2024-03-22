import config, { ISchedulerProps } from './Scheduler.config';
import { T4DComponent, useEnhancedEditor } from '@ws-ui/webform-editor';
import Build from './Scheduler.build';
import Render from './Scheduler.render';

const Scheduler: T4DComponent<ISchedulerProps> = (props) => {
  const { enabled } = useEnhancedEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return enabled ? <Build {...props} /> : <Render {...props} />;
};

Scheduler.craft = config.craft;
Scheduler.info = config.info;
Scheduler.defaultProps = config.defaultProps;

export default Scheduler;
