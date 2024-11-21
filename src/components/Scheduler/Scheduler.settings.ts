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
    options: [
      { value: 'en', label: 'English' },
      { value: 'fr', label: 'French' },
      { value: 'es', label: 'Spanish' },
      { value: 'de', label: 'German' },
    ],
    defaultValue: 'en',
  },
  {
    key: 'minutes',
    label: 'Minutes Interval',
    type: ESetting.SELECT,
    options: [
      { value: '60', label: '60 min' },
      { value: '30', label: '30 min' },
      { value: '15', label: '15 min' },
    ],
    defaultValue: '60',
  },
  {
    key: 'hours',
    label: 'Day Hours',
    type: ESetting.SELECT,
    options: [
      { value: 'work', label: 'Work Hours' },
      { value: 'all', label: 'All' },
    ],
    defaultValue: 'all',
  },
  {
    key: 'days',
    label: 'Week Days',
    type: ESetting.SELECT,
    options: [
      { value: 'full', label: 'All' },
      { value: 'work', label: 'Business Days' },
    ],
    defaultValue: 'full',
  },
  {
    key: 'timeFormat',
    label: 'Time Format',
    type: ESetting.SELECT,
    options: [
      { value: '24', label: '24 Hours' },
      { value: '12', label: '12 Hours' },
    ],
    defaultValue: '24',
  },
  {
    key: 'headerPosition',
    label: 'Header Display',
    type: ESetting.SELECT,
    options: [
      { value: '', label: 'Auto' },
      { value: 'sticky', label: 'Sticky' },
    ],
    defaultValue: '',
  },
  {
    key: 'height',
    label: 'Row Height',
    type: ESetting.UNITFIELD,
    hasLabel: true,
    defaultValue: '64px',
  },
  {
    key: 'todayButton',
    label: 'Today Button',
    type: ESetting.CHECKBOX,
    defaultValue: true,
  },
  {
    key: 'yearNav',
    label: 'Year Navigation',
    type: ESetting.CHECKBOX,
    defaultValue: true,
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

const attributesSettings: TSetting[] = [
  {
    key: 'property',
    label: 'Property',
    type: ESetting.TEXT_FIELD,
    defaultValue: '',
  },
  {
    key: 'startDate',
    label: 'Date',
    type: ESetting.TEXT_FIELD,
    defaultValue: '',
  },
  {
    key: 'startTime',
    label: 'Start Time',
    type: ESetting.TEXT_FIELD,
    defaultValue: '',
  },
  {
    key: 'endTime',
    label: 'End Time',
    type: ESetting.TEXT_FIELD,
    defaultValue: '',
  },
  {
    key: 'colorProp',
    label: 'Color Property',
    type: ESetting.TEXT_FIELD,
  },
  {
    key: 'colors',
    name: 'Colors',
    label: 'Colors',
    type: ESetting.DATAGRID,
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
