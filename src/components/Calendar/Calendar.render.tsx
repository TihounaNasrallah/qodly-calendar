import {
  dateTo4DFormat,
  isLocalArrayDataSource,
  splitDatasourceID,
  unsubscribeFromDatasource,
  // useDataLoader,
  useRenderer,
  useSources,
  useWebformPath,
} from '@ws-ui/webform-editor';

import cn from 'classnames';
import { FC, useEffect, useState, useMemo, useRef } from 'react';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md';
import { colorToHex, generateColorPalette, randomColor } from '../shared/colorUtils';
import {
  startOfWeek,
  endOfWeek,
  endOfMonth,
  isToday,
  startOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  format,
  isSameMonth,
  addDays,
} from 'date-fns';
import { ICalendarProps } from './Calendar.config';
import { fr, es, de, enUS } from 'date-fns/locale';
import { updateEntity } from '../hooks/useDsChangeHandler';
import findIndex from 'lodash/findIndex';
import Spinner from '../shared/Spinner';
import _ from 'lodash';

const Calendar: FC<ICalendarProps> = ({
  type,
  weekStart,
  language,
  selectedDate,
  property,
  startDate,
  endDate,
  rowHeight,
  color,
  selectedColor,
  colors = [],
  attributes = [],
  colorProp,
  yearNav,
  borderRadius,
  style,
  className,
  classNames = [],
}) => {
  const { connect, emit } = useRenderer();
  const {
    sources: { datasource, currentElement: selectedElement },
  } = useSources();

  const [date, setDate] = useState(new Date());
  const [selDate, setSelDate] = useState(new Date());
  const [selEvent, setSelEvent] = useState<any>(null);
  const hasMounted = useRef(false);
  const path = useWebformPath();
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState<any[]>([]);

  const attrs = useMemo(
    () =>
      datasource?.type === 'entitysel'
        ? Object.keys(datasource.dataclass)
        : isLocalArrayDataSource(datasource)
          ? Object.keys((datasource as any).value[0])
          : [],
    [datasource],
  );

  let { entities, fetchIndex, setStep, query, loaderDatasource } = useDataLoader({
    source: datasource,
  });
  const colorgenerated = useMemo(
    () => generateColorPalette(entities.length, ...colors.map((e) => e.color || randomColor())),
    [entities.length, colors],
  );

  let attributeList = attributes?.map((e) => e.Attribute);

  const monthQuery = async (source: datasources.DataSource, newMonth: Date) => {
    setLoading(true);
    if (!source) return;
    if (source.type === 'entitysel') {
      if (attrs.includes(startDate.split('.')[0])) {
        const startOfWeekDate = format(
          startOfWeek(startOfMonth(newMonth), { weekStartsOn: 1 }),
          'yyyy-MM-dd',
        );
        const endOfMonthDate = format(
          endOfWeek(endOfMonth(newMonth), { weekStartsOn: 1 }),
          'yyyy-MM-dd',
        );

        const queryStr = `${startDate} >= :1 AND ${startDate} <= :2`;
        const placeholders = [startOfWeekDate, endOfMonthDate];

        query.entitysel({
          queryString: queryStr,
          placeholders,
        });
      } else {
        checkParams = `"${startDate}" does not exist as an attribute`;
      }
    } else if (source.dataType === 'array') {
      setValue(await source.getValue());
    }
    setLoading(false);
  };

  let checkParams = useMemo(() => {
    if (!datasource) {
      return 'Please set "Datasource"';
    } else if (!entities[0] || !entities.length) {
      return '';
    }
    if (!property) {
      return 'Please set "Property"';
    } else if (!attrs.includes(property)) {
      return `"${property}" does not exist as an attribute`;
    }
    if (!startDate) {
      return 'Please set the "Start Date"';
    } else if (!attrs.includes(startDate)) {
      return `"${startDate}" does not exist as an attribute`;
    }
    if (!endDate) {
      return 'Please set the "End Date"';
    } else if (!attrs.includes(endDate)) {
      return `"${endDate}" does not exist as an attribute`;
    }
    return '';
  }, [datasource, entities]);

  // * Prevent onMonthChange from executing from the get-Go
  useEffect(() => {
    if (hasMounted.current) {
      emit('onMonthChange', { currentDate: date });
    } else {
      hasMounted.current = true;
    }
  }, [date]);

  // first init for the calender.
  useEffect(() => {
    if (!datasource || !(datasource as any).entitysel) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      monthQuery(loaderDatasource, date);
    };

    fetch();
  }, []);

  useEffect(() => {
    if (!datasource) return;

    const cb = () => {
      console.log('callback');
      monthQuery(loaderDatasource, date);
    };
    datasource.addListener('changed', cb);
    return () => {
      unsubscribeFromDatasource(datasource, cb);
    };
  }, [datasource, date, loaderDatasource, (datasource as any).entitysel]);

  useEffect(() => {
    const fetchData = async () => {
      let selLength = await loaderDatasource.getValue('length');
      setStep({ start: 0, end: selLength });
      await fetchIndex(0);
    };

    fetchData();
  }, [loaderDatasource]);

  const isSelectedEvent = (event: any) => {
    return (
      (event[property] === selEvent?.[property] &&
        event[startDate] === selEvent?.[startDate] &&
        event[endDate] === selEvent?.[endDate]) ||
      false
    );
  };

  const prevMonth = () => {
    monthQuery(loaderDatasource, subMonths(date, 1));
    setDate(subMonths(date, 1));
  };
  const nextMonth = () => {
    monthQuery(loaderDatasource, addMonths(date, 1));
    setDate(addMonths(date, 1));
  };
  const nextYear = () => {
    monthQuery(loaderDatasource, addMonths(date, 12));
    setDate(addMonths(date, 12));
  };
  const prevYear = () => {
    monthQuery(loaderDatasource, subMonths(date, 12));
    setDate(subMonths(date, 12));
  };

  let coloredData = useMemo(
    () =>
      (datasource.dataType === 'array' ? value : entities).map((obj: any, index) => ({
        ...obj,
        color: obj[colorProp] || colorgenerated[index],
        attributes: attributeList?.reduce((acc: { [key: string]: any }, e) => {
          acc[e] = obj[e];
          return acc;
        }, {}),
      })),
    [entities, colorgenerated, colorProp, attributeList],
  );

  const handleDateClick = async (value: Date) => {
    setSelDate(value);
    if (!selectedDate) return;
    const { id, namespace } = splitDatasourceID(selectedDate);
    const ds =
      window.DataSource.getSource(id, namespace) || window.DataSource.getSource(selectedDate, path);
    ds?.setValue(
      null,
      value instanceof Date && !isNaN(value.valueOf()) ? dateTo4DFormat(value) : value,
    );
    const ce = await ds?.getValue();
    emit('onDateClick', { selectedDate: ce });
  };

  const handleItemClick = async (item: any) => {
    setSelEvent(item);
    if (!selectedElement) return;
    switch (selectedElement.type) {
      case 'scalar':
        selectedElement.setValue(null, item);
        emit('onItemClick', { selectedData: selectedElement });
        break;
      case 'entity':
        const index = findIndex(
          entities,
          (e: any) =>
            e[property] === item[property] &&
            e[startDate] === item[startDate] &&
            e[endDate] === item[endDate],
        );
        await updateEntity({ index, datasource, currentElement: selectedElement });
        emit('onItemClick', { selectedData: selectedElement });
        break;
    }
  };

  const startOfWeekInt = parseInt(weekStart, 10) as 0 | 1;

  const daysInMonth = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(date), { weekStartsOn: startOfWeekInt }),
        end: endOfWeek(endOfMonth(date), { weekStartsOn: startOfWeekInt }),
      }),
    [date],
  );
  let localeVar = language === 'fr' ? fr : language === 'es' ? es : language === 'de' ? de : enUS;

  let weekDays = Array.from({ length: type === 'work' ? 5 : 7 }, (_, i) => {
    return {
      index: addDays(startOfWeek(date, { weekStartsOn: startOfWeekInt }), i),
      title: format(addDays(startOfWeek(date, { weekStartsOn: startOfWeekInt }), i), 'EE', {
        locale: localeVar,
      }),
      day: format(addDays(startOfWeek(date, { weekStartsOn: startOfWeekInt }), i), 'EEEE', {
        locale: localeVar,
      }),
    };
  });

  const filteredDays = useMemo(
    () =>
      daysInMonth.filter((day) => {
        if (type === 'work') {
          const dayOfWeek = day.getDay();
          return dayOfWeek >= 1 && dayOfWeek <= 5;
        }
        return true;
      }),
    [daysInMonth, type],
  );

  return !checkParams ? (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      {loading && <Spinner />}
      <div className="calendar-container flex flex-col gap-4 w-full h-full">
        <div
          className={`calendar-header w-full flex justify-center gap-2 items-center ${style?.fontSize ? style?.fontSize : 'text-xl'}`}
        >
          <button
            title="Previous year"
            className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300"
            onClick={prevYear}
            style={{ display: yearNav ? '' : 'none' }}
          >
            <MdKeyboardDoubleArrowLeft />
          </button>
          <button
            title="Previous month"
            className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300"
            onClick={prevMonth}
          >
            <MdKeyboardArrowLeft />
          </button>
          <h2
            className={`month-title w-44 text-center ${style?.fontWeight ? style?.fontWeight : 'font-semibold'}`}
          >
            {format(date, 'MMMM yyyy', { locale: localeVar }).charAt(0).toUpperCase() +
              format(date, 'MMMM yyyy', { locale: localeVar }).slice(1)}
          </h2>
          <button
            title="Next month"
            className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300"
            onClick={nextMonth}
          >
            <MdKeyboardArrowRight />
          </button>
          <button
            title="Next year"
            className="nav-button rounded-full p-1 hover:bg-gray-300 duration-300"
            onClick={nextYear}
            style={{ display: yearNav ? '' : 'none' }}
          >
            <MdKeyboardDoubleArrowRight />
          </button>
        </div>

        <div
          className="calendar-grid w-full grid justify-center"
          style={{
            gridTemplateColumns: `repeat(${weekDays.length}, minmax(0, 1fr))`,
          }}
        >
          {weekDays.map((day) => (
            <span
              key={day.title}
              title={day.day}
              className={`weekday-title ${style?.fontWeight ? style?.fontWeight : 'font-medium'} ${style?.fontSize ? style?.fontSize : 'text-lg'} text-center`}
            >
              {format(day.index, 'EEE', { locale: localeVar }).charAt(0).toUpperCase() +
                format(day.index, 'EEE', { locale: localeVar }).slice(1)}
            </span>
          ))}
          {filteredDays.map((day) => {
            const data = coloredData.filter((item) => {
              const itemStartDate = new Date(item[startDate]);
              const itemEndDate = new Date(item[endDate]);
              return datasource.type === 'scalar'
                ? day >= itemStartDate && day <= itemEndDate
                : day >= new Date(dateTo4DFormat(itemStartDate)) &&
                    day <= new Date(dateTo4DFormat(itemEndDate));
            });
            return (
              <div
                key={day.toString()}
                className={`day-container flex flex-col justify-start items-start gap-1 p-1 w-full`}
                style={{
                  color: isSameMonth(day, date)
                    ? style?.color
                      ? style?.color
                      : 'black'
                    : '#C0C0C0',
                  borderWidth: style?.borderWidth ? style?.borderWidth : '1px',
                  borderColor: style?.borderColor ? style?.borderColor : '#E0E0E0',
                  backgroundColor: isSameMonth(day, date)
                    ? style?.backgroundColor
                      ? style?.backgroundColor
                      : 'white'
                    : '#F3F4F6',
                  height: rowHeight,
                }}
              >
                <div className="h-fit w-full">
                  <span
                    className={`day-number h-7 w-7 flex items-center justify-center ${style?.fontWeight ? style?.fontWeight : 'font-medium'} rounded-full cursor-pointer hover:bg-gray-300 duration-300`}
                    style={{
                      border: day === selDate ? `2px solid ${colorToHex(color)}` : '',
                      backgroundColor: isToday(day) ? color : '',
                      color: isToday(day) ? 'white' : '',
                    }}
                    onClick={() => handleDateClick(day)}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
                <div
                  className={`date-content w-full grid grid-cols-1 gap-1 overflow-hidden overflow-y-auto`}
                >
                  {data.map((item, index) => {
                    return (
                      <div
                        key={`${item[property]}-${item[startDate]}`}
                        className={`element-container cursor-pointer px-2 py-1 flex flex-col w-full border-l-4 text-black`}
                        style={{
                          color: isSameMonth(day, date) ? 'black' : '#969696',
                          backgroundColor: isSameMonth(day, date)
                            ? isSelectedEvent(item)
                              ? colorToHex(selectedColor) + '70'
                              : colorToHex(item?.color) + '50'
                            : '#E3E3E3',
                          borderRadius: borderRadius,
                          borderLeftColor: isSameMonth(day, date)
                            ? isSelectedEvent(item)
                              ? colorToHex(selectedColor)
                              : colorToHex(item?.color)
                            : '#C0C0C0',
                        }}
                        onClick={() => handleItemClick(item)}
                      >
                        <span
                          title={item[property]}
                          key={index}
                          className={`element-title ${style?.fontWeight ? style?.fontWeight : 'font-medium'} line-clamp-2`}
                        >
                          {item[property]}
                        </span>

                        <div key={`attributes-${index}`} className="element-detail flex flex-wrap">
                          {attributeList?.map((e) => {
                            return (
                              <span
                                key={`attribute-${index}-${e}`}
                                className={`attribute ${style?.fontSize ? style?.fontSize : 'text-sm'} basis-1/2 text-start`}
                                title={item?.attributes[e]?.toString()}
                              >
                                {item.attributes[e]}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-red-600 py-4 text-red-700">
      <BsFillInfoCircleFill className=" h-6 w-6" />
      <p className=" font-medium">{checkParams}</p>
    </div>
  );
};

export default Calendar;
