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
    key: 'language',
    label: 'Language',
    type: ESetting.SELECT,
    options: [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
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
      { value: 'all', label: 'All' },
      { value: 'work', label: 'Work Hours' },
    ],
    defaultValue: 'all',
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
      { value: 'auto', label: 'Auto' },
      { value: 'sticky', label: 'Sticky' },
    ],
    defaultValue: 'auto',
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
    key: 'eventDate',
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
    defaultValue: '',
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
