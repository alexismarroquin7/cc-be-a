const notion = require('../../notion');

const NOTION_EMPLOYEES_DB_ID = process.env.NODE_ENV === 'development' 
? process.env.NOTION_EMPLOYEES_DB_ID_TEST
: process.env.NOTION_EMPLOYEES_DB_ID;

const findAll = async () => {

  const employees = await notion.databases.query({
    database_id: NOTION_EMPLOYEES_DB_ID,
    sorts: [
      {
        property: 'name',
        direction: 'ascending'
      }
    ]
  });

  return employees;
}

const create = async ({name, phoneNumber}) => {
  const res = await notion.pages.create({
    parent: {
      database_id: NOTION_EMPLOYEES_DB_ID
    },
    properties: {
      name: {
        type: 'title',
        title: [
          {
            type: 'text',
            text: {
              content: name
            }
          }
        ]
      },
      phone_number: {
        type: 'phone_number',
        phone_number: phoneNumber
      }
    }
  })
  return res;
}

const findByEmployeeId = async (employee_id) => {
  const employees = await findAll();

  const employee = employees.results.filter(emp => emp.id === employee_id);
  
  const match = employee.length === 1;
  
  if(match){
    return employee[0];
  } else {
    return null;
  }
  
}

module.exports = {
  findAll,
  findByEmployeeId,
  create
}