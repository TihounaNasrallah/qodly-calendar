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
    ],
    datasources: {
      accept: ['array'],
    },
  },
  defaultProps: {
    days: 'full',
    color: '#1a73e8',
    timeFormat: '12',
    todayButton: true,
    headerPosition: '',
    language: 'en',
  },
} as T4DComponentConfig<IDayViewProps>;

export interface IDayViewProps extends webforms.ComponentProps {
  property: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  color: string;
  timeFormat?: string;
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
