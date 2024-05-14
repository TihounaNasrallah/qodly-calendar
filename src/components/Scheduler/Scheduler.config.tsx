import { EComponentKind, T4DComponentConfig } from '@ws-ui/webform-editor';
import { Settings } from '@ws-ui/webform-editor';
import { MdCalendarViewWeek } from 'react-icons/md';

import SchedulerSettings, { BasicSettings } from './Scheduler.settings';

export default {
  craft: {
    displayName: 'Scheduler',
    rules: {
      canMoveIn: () => true,
      canMoveOut: () => true,
    },
    kind: EComponentKind.BASIC,
    props: {
      name: '',
      classNames: [],
      events: [],
    },
    related: {
      settings: Settings(SchedulerSettings, BasicSettings),
    },
  },
  info: {
    displayName: 'Scheduler',
    exposed: true,
    icon: MdCalendarViewWeek,
    events: [],
    datasources: {
      accept: ['array'],
    },
  },
  defaultProps: {
    days: 'full',
    color: '#1a73e8',
    timeFormat: '12',
    fontSize: '12px',
    height: '64px',
  },
} as T4DComponentConfig<ISchedulerProps>;

export interface ISchedulerProps extends webforms.ComponentProps {
  color: string;
  timeFormat: '12' | '24';
  headerPosition: 'sticky' | '';
  fontSize?: string;
  height?: string;
  property: string;
  startDate: string;
  startTime: string;
  endTime: string;
  colors?: IColors[];
  hours?: string;
  days?: string;
}

export interface IColors {
  color?: string;
}
