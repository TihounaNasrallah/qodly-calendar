import {
  EComponentKind,
  splitDatasourceID,
  T4DComponentConfig,
  T4DComponentDatasourceDeclaration,
} from '@ws-ui/webform-editor';
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
      accept: ['array', 'entitysel'],
      declarations: (props: any) => {
        const {
          property,
          startDate,
          startTime,
          endTime,
          colorProp,
          attributes,
          datasource = '',
        } = props as ISchedulerProps;
        const declarations: T4DComponentDatasourceDeclaration[] = [
          { path: datasource, iterable: true },
        ];

        if (property) {
          const { id: propertySrc } = splitDatasourceID(property);
          declarations.push({ path: `${datasource}.[].${propertySrc}` });
        }

        if (startDate) {
          const { id: startDateSrc } = splitDatasourceID(startDate);
          declarations.push({ path: `${datasource}.[].${startDateSrc}` });
        }

        if (startTime) {
          const { id: startTimeSrc } = splitDatasourceID(startTime);
          declarations.push({ path: `${datasource}.[].${startTimeSrc}` });
        }

        if (endTime) {
          const { id: endTimeSrc } = splitDatasourceID(endTime);
          declarations.push({ path: `${datasource}.[].${endTimeSrc}` });
        }

        if (colorProp) {
          const { id: colorPropSrc } = splitDatasourceID(colorProp);
          declarations.push({ path: `${datasource}.[].${colorPropSrc}` });
        }

        if (attributes) {
          attributes.forEach((attr) => {
            const { id: attrSrc } = splitDatasourceID(attr.Attribute);
            declarations.push({ path: `${datasource}.[].${attrSrc}` });
          });
        }

        return declarations;
      },
    },
  },
  defaultProps: {
    language: 'en',
    weekStart: '1',
    yearNav: true,
    minutes: '60',
    days: 'full',
    color: '#1a73e8',
    selectedColor: '#C084FC',
    timeFormat: '24',
    height: '64px',
    headerPosition: '',
    todayButton: true,
  },
} as T4DComponentConfig<ISchedulerProps>;

export interface ISchedulerProps extends webforms.ComponentProps {
  color: string;
  selectedColor: string;
  weekStart: string;
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
  attributes: IAttributes[];
  todayButton?: boolean;
  hours?: string;
  days?: string;
}

export interface IColors {
  color?: string;
}

export interface IAttributes {
  Attribute: string;
}
