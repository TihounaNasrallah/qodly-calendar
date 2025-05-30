import {
  EComponentKind,
  splitDatasourceID,
  T4DComponentConfig,
  T4DComponentDatasourceDeclaration,
} from '@ws-ui/webform-editor';
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
      accept: ['array', 'entitysel'],
      declarations: (props: any) => {
        const {
          property,
          startDate,
          endDate,
          colorProp,
          attributes,
          datasource = '',
        } = props as ICalendarProps;
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

        if (endDate) {
          const { id: endDateSrc } = splitDatasourceID(endDate);
          declarations.push({ path: `${datasource}.[].${endDateSrc}` });
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
    weekStart: '1',
    color: '#1a73e8',
    language: 'en',
    type: 'full',
    selectedColor: '#C084FC',
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
  weekStart: string;
  type?: string;
  attributes: IAttributes[];
}

export interface IColors {
  color?: string;
}

export interface IAttributes {
  Attribute: string;
}
