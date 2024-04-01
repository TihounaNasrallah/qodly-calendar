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
    key: 'hours',
    label: 'Hours',
    type: ESetting.SELECT,
    options: [
      { value: 'work', label: 'Work Hours' },
      { value: 'all', label: 'All' },
    ],
    defaultValue: 'all',
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
    key: 'fontSize',
    label: 'Element Font Size',
    type: ESetting.UNITFIELD,
    hasLabel: true,
    defaultValue: '12px',
  },
  {
    key: 'height',
    label: 'Row Height',
    type: ESetting.UNITFIELD,
    hasLabel: true,
    defaultValue: '64px',
  },
];

const dataAccessSettings: TSetting[] = [
  {
    key: 'datasource',
    label: 'Data Source',
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
