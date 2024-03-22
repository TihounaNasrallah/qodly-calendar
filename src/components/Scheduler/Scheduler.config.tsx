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
      accept: ['array'],
    },
  },
  defaultProps: {
    color: '#3b82f6',
    timeFormat: '12',
  },
} as T4DComponentConfig<ISchedulerProps>;

export interface ISchedulerProps extends webforms.ComponentProps {
  color?: string;
  timeFormat?: '12' | '24';
}
