import {
  EComponentKind,
  splitDatasourceID,
  T4DComponentConfig,
  T4DComponentDatasourceDeclaration,
} from '@ws-ui/webform-editor';
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
      accept: ['array', 'entitysel'],
      declarations: (props: any) => {
        const {
          property,
          eventDate,
          startTime,
          endTime,
          colorProp,
          attributes,
          datasource = '',
        } = props as IDayViewProps;
        const declarations: T4DComponentDatasourceDeclaration[] = [
          { path: datasource, iterable: true },
        ];

        const { id: ds, namespace } = splitDatasourceID(datasource?.trim()) || {};

        if (property) {
          const propertySrc = `${ds}.[].${property}`;
          declarations.push({ path: namespace ? `${namespace}:${propertySrc}` : propertySrc });
        }

        if (eventDate) {
          const startDateSrc = `${ds}.[].${eventDate}`;
          declarations.push({ path: namespace ? `${namespace}:${startDateSrc}` : startDateSrc });
        }

        if (startTime) {
          const startTimeSrc = `${ds}.[].${startTime}`;
          declarations.push({ path: namespace ? `${namespace}:${startTimeSrc}` : startTimeSrc });
        }

        if (endTime) {
          const endTimeSrc = `${ds}.[].${endTime}`;
          declarations.push({ path: namespace ? `${namespace}:${endTimeSrc}` : endTimeSrc });
        }

        if (colorProp) {
          const colorPropSrc = `${ds}.[].${colorProp}`;
          declarations.push({ path: namespace ? `${namespace}:${colorPropSrc}` : colorPropSrc });
        }

        if (attributes) {
          attributes.forEach((attr) => {
            const attrSrc = `${ds}.[].${attr.Attribute}`;
            declarations.push({ path: namespace ? `${namespace}:${attrSrc}` : attrSrc });
          });
        }

        return declarations;
      },
    },
  },
  defaultProps: {
    days: 'full',
    color: '#1a73e8',
    selectedColor: '#C084FC',
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
  selectedColor: string;
  minutes: '60' | '15' | '30';
  timeFormat: '12' | '24';
  hours?: string;
  language: string;
  headerPosition: 'sticky' | '';
  todayButton?: boolean;
  colorProp: string;
  colors?: IColors[];
  attributes: IAttributes[];
}

export interface IColors {
  color?: string;
}

export interface IAttributes {
  Attribute: string;
}
