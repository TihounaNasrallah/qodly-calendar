import { ESetting, TSetting } from '@ws-ui/webform-editor';
import { BASIC_SETTINGS, DEFAULT_SETTINGS, load } from '@ws-ui/webform-editor';

const commonSettings: TSetting[] = [
  {
    key: 'color',
    label: 'Current Day Color',
    type: ESetting.COLOR_PICKER,
    defaultValue: '#4169E1',
  },
  {
    key: 'color1',
    label: 'Color 1',
    type: ESetting.COLOR_PICKER,
    defaultValue: '#3f0081',
  },
  {
    key: 'color2',
    label: 'Color 2',
    type: ESetting.COLOR_PICKER,
    defaultValue: '#6e61ab',
  },
  {
    key: 'color3',
    label: 'Color 3',
    type: ESetting.COLOR_PICKER,
    defaultValue: '#7630ff',
  },
  {
    key: 'yearNav',
    label: 'Year Navigation',
    type: ESetting.CHECKBOX,
    defaultValue: true,
  },
  {
    key: 'rowHeight',
    label: 'Row Height',
    type: ESetting.UNITFIELD,
    placeholder: 'Row Height',
    defaultValue: '200px',
  },
];

const attributesSettings: TSetting[] = [
  {
    key: 'att1',
    label: 'Attribute 1',
    type: ESetting.TEXT_FIELD,
    defaultValue: '',
  },
  {
    key: 'att2',
    label: 'Attribute 2',
    type: ESetting.TEXT_FIELD,
    defaultValue: '',
  },
];

const dataAccessSettings: TSetting[] = [
  {
    key: 'datasource',
    label: 'Data Source',
    type: ESetting.DS_AUTO_SUGGEST,
  },
  {
    key: 'serverSideRef',
    label: 'Server Side',
    type: ESetting.TEXT_FIELD,
    validateOnEnter: true,
  },
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
    label: 'Attributes to Display',
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
