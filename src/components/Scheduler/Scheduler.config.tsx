import { EComponentKind, T4DComponentConfig } from '@ws-ui/webform-editor';
import { Settings } from '@ws-ui/webform-editor';
import { MdCalendarViewWeek } from 'react-icons/md';

import SchedulerSettings, { BasicSettings } from './Scheduler.settings';

export default {
  craft: {
    displayName: 'WeekView',
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
    displayName: 'WeekView',
    exposed: true,
    icon: MdCalendarViewWeek,
    events: [],
    datasources: {
      accept: ['array'],
    },
  },
  defaultProps: {
    language: 'en',
    days: 'full',
    color: '#1a73e8',
    timeFormat: '12',
    fontSize: '12px',
    height: '64px',
    todayButton: true,
  },
} as T4DComponentConfig<ISchedulerProps>;

export interface ISchedulerProps extends webforms.ComponentProps {
  color: string;
  language: string;
  timeFormat: '12' | '24';
  headerPosition: 'sticky' | '';
  fontSize?: string;
  height?: string;
  property: string;
  startDate: string;
  startTime: string;
  endTime: string;
  colors?: IColors[];
  todayButton?: boolean;
  hours?: string;
  days?: string;
}

export interface IColors {
  color?: string;
}
