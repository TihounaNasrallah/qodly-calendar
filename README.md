## Overview

This Calendar Component is a versatile tool designed to provide an intuitive and interactive calendar interface . It allows users to easily navigate between months, or years, show data related to every single day
## Calendar Component
![The Calendar Component](https://github.com/TihounaNasrallah/qodly-calendar/assets/73143827/8b094da7-d1bb-4765-85bb-1b62a87748d1)

### Properties :

| Name | Type | Default | Description |
| -------- | ------- | -------- | ------- |
| Current Day Color | string | #4169E1 | Sets the background color of the current day |
| Color 1 | string | #3468C0 | Sets the background color of the first element to be displayed in the calendar |
| Color 2 | string | #86B6F6 | Sets the background color of the second element to be displayed in the calendar |
| Color 3 | string | #B4D4FF | Sets the background color of the third element to be displayed in the calendar |
| Year Navigation | boolean | true | If true, the year navigation buttons will be displayed |
| Row Height | string | 200px | Sets the Height of the calendar rows |
| Border Radius | string | 0px | Sets the border redius of the displayed elements |

### Data Access Properties :

| Name | Type | Required | Description |
| -------- | ------- | -------- | ------- |
|Data Source|Array of Objects|Yes|will contain an array of objects|
|Property|string|Yes|will contain the property to be displayed|
|First Date|string|Yes|will contain the attribute of the start date in our array|
|Last Date|string|Yes|will contain the attribute of the end date in our array|
|Attribute 1|string|No|will contain an additional property to be displayed|
|Attribute 2|string|No|will contain an additional property to be displayed|

### Custom CSS :

When customizing the appearance of the calendar, you have access to the following classes within the component :

![Calendar Classes](https://github.com/TihounaNasrallah/qodly-calendar/assets/73143827/8bed4358-ac3c-45f1-8e60-a666d6957b01)








