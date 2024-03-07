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
        label: 'On Click',
        value: 'onclick',
      },
      {
        label: 'On Blur',
        value: 'onblur',
      },
      {
        label: 'On Focus',
        value: 'onfocus',
      },
      {
        label: 'On MouseEnter',
        value: 'onmouseenter',
      },
      {
        label: 'On MouseLeave',
        value: 'onmouseleave',
      },
      {
        label: 'On KeyDown',
        value: 'onkeydown',
      },
      {
        label: 'On KeyUp',
        value: 'onkeyup',
      },
    ],
    datasources: {
      accept: ['scalar'],
    },
  },
  defaultProps: {
    color: '#4169E1',
    yearNav: true,
    rowHeight: '150px',
    color1: '#435585',
    color2: '#363062',
    color3: '#818FB4',
  },
} as T4DComponentConfig<ICalendarProps>;

export interface ICalendarProps extends webforms.ComponentProps {
  color: string;
  yearNav: boolean;
  rowHeight: string;
  color1: string;
  color2: string;
  color3: string;
}
