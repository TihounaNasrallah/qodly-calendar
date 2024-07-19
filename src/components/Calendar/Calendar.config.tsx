import { EComponentKind, T4DComponentConfig } from '@ws-ui/webform-editor';
import { Settings } from '@ws-ui/webform-editor';
import { MdOutlineCalendarMonth } from 'react-icons/md';

import CalendarSettings, { BasicSettings } from './Calendar.settings';

export default {
  craft: {
    displayName: 'Calendar',
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
      settings: Settings(CalendarSettings, BasicSettings),
    },
  },
  info: {
    displayName: 'Calendar',
    exposed: true,
    icon: MdOutlineCalendarMonth,
    events: [
      {
        label: 'On Date Click',
        value: 'onDateClick',
      },
      {
        label: 'On Item Click',
        value: 'onItemClick',
      },
      {
        label: 'On Month Change',
        value: 'onMonthChange',
      },
    ],
    datasources: {
      accept: ['array'],
    },
  },
  defaultProps: {
    color: '#4169E1',
    language: 'en',
    type: 'full',
    selectedColor: '#4169E1',
    yearNav: true,
    borderRadius: '6px',
    rowHeight: '150px',
    colorProp: '',
  },
} as T4DComponentConfig<ICalendarProps>;

export interface ICalendarProps extends webforms.ComponentProps {
  color: string;
  selectedColor: string;
  yearNav: boolean;
  borderRadius: string;
  property: string;
  selectedDate: string;
  startDate: string;
  endDate: string;
  rowHeight: string;
  colorProp: string;
  colors?: IColors[];
  language?: string;
  type?: string;
  attributes: IAttributes[];
}

export interface IColors {
  color?: string;
}

export interface IAttributes {
  Attribute: string;
}
