import { EComponentKind, T4DComponentConfig } from '@ws-ui/webform-editor';
import { Settings } from '@ws-ui/webform-editor';
import { MdCalendarViewDay } from 'react-icons/md';

import DayViewSettings, { BasicSettings } from './DayView.settings';

export default {
  craft: {
    displayName: 'DayView',
    rules: {
      canMoveIn: () => true,
      canMoveOut: () => true,
    },
    kind: EComponentKind.BASIC,
    props: {
      classNames: [],
      events: [],
    },
    related: {
      settings: Settings(DayViewSettings, BasicSettings),
    },
  },
  info: {
    displayName: 'DayView',
    exposed: true,
    icon: MdCalendarViewDay,
    events: [
      {
        label: 'On Item Click',
        value: 'onItemClick',
      },
      {
        label: 'On Day Change',
        value: 'onDayChange',
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
    days: 'full',
    color: '#1a73e8',
    timeFormat: '24',
    minutes: '60',
    todayButton: true,
    headerPosition: '',
    language: 'en',
  },
} as T4DComponentConfig<IDayViewProps>;

export interface IDayViewProps extends webforms.ComponentProps {
  selectedDate: string;
  property: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  color: string;
  minutes: '60' | '15' | '30';
  timeFormat: '12' | '24';
  hours?: string;
  language: string;
  headerPosition: 'sticky' | '';
  todayButton?: boolean;
  colorProp: string;
  colors?: IColors[];
}

export interface IColors {
  color?: string;
}
