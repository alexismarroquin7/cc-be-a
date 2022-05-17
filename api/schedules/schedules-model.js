const notion = require('../../notion');
const Employee = require('../employees/employee-model');

const NOTION_SCHEDULES_DB_ID = process.env.NODE_ENV === 'development' 
? process.env.NOTION_SCHEDULES_DB_ID_TEST
: process.env.NOTION_SCHEDULES_DB_ID;

const findAll = async () => {
  const schedules = await notion.databases.query({
    database_id: NOTION_SCHEDULES_DB_ID,
    sorts: [
      {
        property: 'date',
        direction: 'ascending'
      }
    ]
  });
  
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

const create = async ({ employee_id, date }) => {
  const schedule = await notion.pages.create({
    parent: {
      database_id: NOTION_SCHEDULES_DB_ID
    },
    properties: {
      Employee: {
        relation: [
          {
            id: employee_id
          }
        ]
      },
      
      Date: {
        date: {
          start: date.start,
          end: date.end,
          time_zone: date.time_zone
        }
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