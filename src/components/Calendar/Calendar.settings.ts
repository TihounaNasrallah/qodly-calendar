import { ESetting, TSetting } from '@ws-ui/webform-editor';
import { BASIC_SETTINGS, DEFAULT_SETTINGS, load } from '@ws-ui/webform-editor';

const commonSettings: TSetting[] = [
  {
    key: 'color',
    label: 'Current Day Color',
    type: ESetting.COLOR_PICKER,
    defaultValue: '#1a73e8',
  },
  {
    key: 'selectedColor',
    label: 'Selected Element Color',
    type: ESetting.COLOR_PICKER,
    defaultValue: '#C084FC',
  },
  {
    key: 'weekStart',
    label: 'First Day of Week',
    type: ESetting.SELECT,
    defaultValue: '1',
    options: [
      { value: '1', label: 'Monday' },
      { value: '0', label: 'Sunday' },
    ],
  },
  {
    key: 'language',
    label: 'Language',
    type: ESetting.SELECT,
    defaultValue: 'en',
    options: [
      { value: 'en', label: 'English' },
      { value: 'fr', label: 'French' },
      { value: 'es', label: 'Spanish' },
      { value: 'de', label: 'German' },
    ],
  },
  {
    key: 'type',
    label: 'Week Days',
    type: ESetting.SELECT,
    defaultValue: 'full',
    options: [
      { value: 'full', label: 'All' },
      { value: 'work', label: 'Business days' },
    ],
  },
  {
    key: 'rowHeight',
    label: 'Row Height',
    type: ESetting.UNITFIELD,
    defaultValue: '150px',
    hasLabel: true,
  },
  {
    key: 'borderRadius',
    label: 'Border Radius',
    type: ESetting.UNITFIELD,
    defaultValue: '6px',
    hasLabel: true,
  },
  {
    key: 'yearNav',
    label: 'Year Navigation',
    type: ESetting.CHECKBOX,
    defaultValue: true,
  },
];

const attributesSettings: TSetting[] = [
  {
    key: 'property',
    label: 'Property',
    type: ESetting.TEXT_FIELD,
    defaultValue: '',
  },
  {
    key: 'startDate',
    label: 'First Date',
    type: ESetting.TEXT_FIELD,
    defaultValue: '',
  },
  {
    key: 'endDate',
    label: 'Last Date',
    type: ESetting.TEXT_FIELD,
    defaultValue: '',
  },
  {
    key: 'colorProp',
    label: 'Color Property',
    type: ESetting.TEXT_FIELD,
    defaultValue: '',
  },
  {
    type: ESetting.DATAGRID,
    key: 'colors',
    name: 'Colors',
    label: 'Colors',
    titleProperty: 'color',
    data: [
      {
        key: 'color',
        label: 'Color',
        type: ESetting.COLOR_PICKER,
        defaultValue: '',
      },
    ],
  },
  {
    type: ESetting.DATAGRID,
    key: 'attributes',
    name: 'Attributes',
    label: 'Attributes',
    titleProperty: 'Attribute',
    data: [
      {
        key: 'Attribute',
        label: 'Attribute',
        type: ESetting.TEXT_FIELD,
        defaultValue: '',
      },
    ],
  },
];

const dataAccessSettings: TSetting[] = [
  {
    key: 'datasource',
    label: 'Qodly Source',
    type: ESetting.DS_AUTO_SUGGEST,
  },
  {
    key: 'currentElement',
    label: 'Selected Element',
    type: ESetting.DS_AUTO_SUGGEST,
  },
  {
    key: 'selectedDate',
    label: 'Selected Date',
    type: ESetting.DS_AUTO_SUGGEST,
  },
  {
    key: 'serverSideRef',
    label: 'Server Side',
    type: ESetting.TEXT_FIELD,
    validateOnEnter: true,
  },
];

const Settings: TSetting[] = [
  {
    key: 'properties',
    label: 'Properties',
    type: ESetting.GROUP,
    components: commonSettings,
  },
  {
    key: 'dataAccess',
    label: 'Data Access',
    type: ESetting.GROUP,
    components: dataAccessSettings,
  },
  {
    key: 'attributes',
    label: 'Data Attributes',
    type: ESetting.GROUP,
    components: attributesSettings,
  },
  ...load(DEFAULT_SETTINGS).filter('dataAccess'),
];

export const BasicSettings: TSetting[] = [
  ...commonSettings,
  ...load(BASIC_SETTINGS).filter('style.overflow'),
];

export default Settings;
