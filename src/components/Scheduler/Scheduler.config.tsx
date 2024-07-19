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
    events: [
      {
        label: 'On Item Click',
        value: 'onItemClick',
      },
      {
        label: 'On Week Change',
        value: 'onWeekChange',
      },
      {
        label: 'On Date Click',
        value: 'onDateClick',
      },
    ],
    datasources: {
      accept: ['array'],
    },
  },
  defaultProps: {
    language: 'en',
    yearNav: true,
    minutes: '60',
    days: 'full',
    color: '#1a73e8',
    timeFormat: '24',
    height: '64px',
    headerPosition: '',
    todayButton: true,
  },
} as T4DComponentConfig<ISchedulerProps>;

export interface ISchedulerProps extends webforms.ComponentProps {
  color: string;
  language: string;
  yearNav: boolean;
  minutes: '60' | '15' | '30';
  timeFormat: '12' | '24';
  headerPosition: 'sticky' | '';
  height?: string;
  selectedDate: string;
  property: string;
  startDate: string;
  startTime: string;
  endTime: string;
  colorProp: string;
  colors?: IColors[];
  todayButton?: boolean;
  hours?: string;
  days?: string;
}

export interface IColors {
  color?: string;
}
