import bookshelf from "../../common-modules/server/config/bookshelf";
import { AttReport, Klass, Lesson, StudentKlass, Group, Student, Teacher } from "../models";

const getColumns = (model) => {
    const tableName = new model().tableName;
    return model
        .query(qb => qb.columnInfo())
        .fetchAll()
        .then(res => res.toJSON())
        .then(res => res[0])
        .then(res => Object.entries(res))
        .then(res => res.map(([key, { type }]) => ({ id: 'C-' + tableName + '.' + key, name: key, type })))
        .then(res => ({ id: 'T-' + tableName, name: tableName, children: res }))
}

export async function getEditData(req, res) {
    const dbMetadata = await Promise.all([
        getColumns(AttReport),
        getColumns(Klass),
        getColumns(Lesson),
        getColumns(StudentKlass),
        getColumns(Group),
        getColumns(Student),
        getColumns(Teacher),
    ]);
    res.json({
        error: null,
        data: dbMetadata
    });
}

const joinsDef = [
    {
        tables: ['students', 'student_klasses'],
        join: 'students.tz = student_klasses.student_tz'
    },
    {
        tables: ['klasses', 'student_klasses'],
        join: '`klasses`.id = student_klasses.klass_id'
    },
    {
        tables: ['klasses', 'groups'],
        join: '`klasses`.id = groups.klass_id'
    },
    {
        tables: ['teachers', 'groups'],
        join: '`teachers`.id = groups.teacher_id'
    },
    {
        tables: ['lessons', 'groups'],
        join: '`lessons`.id = groups.lesson_id'
    },
    {
        tables: ['att_reports', 'students'],
        join: 'students.tz = att_reports.student_tz'
    },
    {
        tables: ['att_reports', 'teachers'],
        join: 'teachers.id = att_reports.teacher_id'
    },
    {
        tables: ['att_reports', 'lessons'],
        join: 'lessons.id = att_reports.lesson_id'
    },
];

const getJoins = (tables) => {
    const joins = [];
    for (const iterator of joinsDef) {
        if (tables.includes(iterator.tables[0]) && tables.includes(iterator.tables[1])) {
            joins.push(iterator.join);
        }
    }
    return joins.length ? 'on ' + joins.join(' and ') : '';
}

const getQuery = (columns) => {
    if (columns.length === 0) {
        return '';
    }
    const columnsArr = columns.map(({ field }) => field);
    const fields = columnsArr.map(item => item + ' as ' + item.replace('.', '_')).join(', ');
    const tableNames = [...new Set(columnsArr.map(col => col.split('.')[0]))];
    const tables = tableNames.map(item => '`' + item + '`').join(' join ');
    const joins = tableNames.length == 1 ? '' : getJoins(tableNames);
    const condition = columns.map(({ field, value }) => `${field} like '%${value}%'`).join(' and ');
    const order = 1;
    return `select ${fields} from ${tables} ${joins} where ${condition} order by ${order}`;
}

export async function getReportResults(req, res) {
    const columns = req.body;
    const query = getQuery(columns);
    const [rows, cols] = await bookshelf.knex.raw(query);
    const previewCols = cols.map(({ name }) => ({ field: name, title: name }))
    res.send({ data: { rows, cols, previewCols } })
}
