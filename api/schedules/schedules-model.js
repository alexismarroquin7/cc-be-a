const notion = require('../../notion');
const Employee = require('../employees/employee-model');

const NOTION_SCHEDULES_DB_ID = process.env.NODE_ENV === 'development' 
? process.env.NOTION_SCHEDULES_DB_ID_TEST
: process.env.NOTION_SCHEDULES_DB_ID;

const findAll = async (
  {
    sortBy = 'date',
    direction = 'asc',
    date_after = null,
    date_before = null,
  }
) => {
  const sortByOptions = new Set(
    'name',
    'date'
  )

  if(sortByOptions.has(sortBy)) throw Error(`unknown sortBy = ${sortBy}`)
  
  const directionOptions = new Set(
    'asc',
    'desc'
  )

  if(directionOptions.has(direction)) throw Error(`unknown direction = ${direction}`);

  
  const sorts = [
    {
      property: sortBy,
      direction: direction === 'asc' ? 'ascending' : 'descending'
    }
  ];
  
  let schedules;

  if(date_after !== null && date_before === null){
    schedules = await notion.databases.query({
      database_id: NOTION_SCHEDULES_DB_ID,
      sorts,
      filter: {
        property: 'date',
        date: {
          after: date_after,
          time_zone: 'America/Los_Angeles'
        }
      }
    });

  } else if(date_after === null && date_before !== null){
    schedules = await notion.databases.query({
      database_id: NOTION_SCHEDULES_DB_ID,
      sorts,
      filter: {
        property: 'date',
        date: {
          before: date_before,
          time_zone: 'America/Los_Angeles'
        }
      }
    });

  } else if(date_after !== null && date_before !== null){
    schedules = await notion.databases.query({
      database_id: NOTION_SCHEDULES_DB_ID,
      sorts,
      filter: {
        and: [
          {
            property: 'date',
            date: {
              after: date_after,
              time_zone: 'America/Los_Angeles'
            }
          },
          
          {
            property: 'date',
            date: {
              before: date_before,
              time_zone: 'America/Los_Angeles'
            }
          },
  
        ]
      }
    });

  } else {
    schedules = await notion.databases.query({
      database_id: NOTION_SCHEDULES_DB_ID,
      sorts
    });
  }
  
  let results = schedules
  .results.map(async res => {
    const employee = await Employee.findByEmployeeId(res.properties.employee.relation[0].id);
    
    return {
      ...res,
      properties: {
        ...res.properties,
        employee: {
          ...res.properties.employee,
          relation: [
            employee
          ]
        }
      }
    };
  
  });
  
  return Promise
  .all(results)
  .then((values) => {
    return {
      ...schedules,
      results: values
    }
  })
}

const findByScheduleId = async (schedule_id) => {
  const schedules = await findAll();

  const schedule = schedules.results.filter(s => s.id === schedule_id);
  
  const match = schedule.length === 1;
  
  if(match){
    return schedule[0];
  } else {
    return null;
  }
  
}

const create = async ({ employee_id, date, duration }) => {
  const schedule = await notion.pages.create({
    parent: {
      database_id: NOTION_SCHEDULES_DB_ID
    },
    properties: {
      employee: {
        relation: [
          {
            id: employee_id
          }
        ]
      },
      
      date: {
        date: {
          start: date.start,
          end: date.end,
          time_zone: date.time_zone
        }
      },

      duration: {
        number: duration
      }
    }
  });

  return schedule;
}

const update = async (schedule_id, changes) => {
  const schedule = await notion.pages.update({
    page_id: schedule_id,
    ...changes,
    archived: changes.archived ? true : false 
  });

  return schedule;
}

module.exports = {
  findAll,
  findByScheduleId,
  update,
  create
}