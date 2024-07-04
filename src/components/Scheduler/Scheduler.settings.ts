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
      { value: '12', label: '12 Hours' },
      { value: '24', label: '24 Hours' },
    ],
    defaultValue: '12',
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
];

const dataAccessSettings: TSetting[] = [
  {
    key: 'datasource',
    label: 'Data Source',
    type: ESetting.DS_AUTO_SUGGEST,
  },
  {
    key: 'currentElement',
    label: 'Selected Item',
    type: ESetting.DS_AUTO_SUGGEST,
  },
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
  ...load(DEFAULT_SETTINGS).filter('dataAccess'),
];

export const BasicSettings: TSetting[] = [
  ...commonSettings,
  ...load(BASIC_SETTINGS).filter('style.overflow'),
];

export default Settings;
