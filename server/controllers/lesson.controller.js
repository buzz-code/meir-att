import Format from 'string-format';
import { Lesson, Teacher, Klass } from '../models';
import { getListFromTable } from '../../common-modules/server/utils/common';
import { getAttExcelBufferByLessonId, getAttExcelBufferByLessonIdAsStream, getGradeExcelBufferByLessonId, getGradeExcelBufferByLessonIdAsStream } from '../utils/excelHelper';
import { sendEmail } from '../../common-modules/server/utils/mailer';
import { getEmailFieldsWithFile } from '../utils/queryHelper';
import { downloadFileFromStream } from '../../common-modules/server/utils/template';

/**
 * Get edit data
 *
 * @param {object} req
 * @param {object} res
 * @returns {*}
 */
export async function getEditData(req, res) {
    const [teachers, klasses] = await Promise.all([
        getListFromTable(Teacher, req.currentUser.id, 'tz'),
        getListFromTable(Klass, req.currentUser.id, 'key'),
    ]);
    res.json({
        error: null,
        data: { teachers, klasses }
    });
}

export async function sendEmailWithFile(req, res) {
    const { body: { ids, type } } = req;

    if (ids.length > 100) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: 'לא ניתן לשלוח יותר מ100 מיילים ביום'
        });
    }

    const { subjectText, bodyText } = await getEmailFieldsWithFile(req.currentUser.id, type);
    const { from_email, reply_to_email, reply_to_grades } = req.currentUser.toJSON();
    const reply_to = type === 'Att' ? reply_to_email : reply_to_grades;
    const getExcelFunc = type === 'Att' ? getAttExcelBufferByLessonId : getGradeExcelBufferByLessonId;

    for (const id of ids) {
        const { fileBuffer, filename, templateData } = await getExcelFunc(id, req.currentUser.id);
        const attachment = {
            content: fileBuffer.toString('base64'),
            filename,
        };
        const body = Format(bodyText, templateData.lesson.teacher.name, templateData.lesson.name);
        await sendEmail(templateData.lesson.teacher.email, from_email, subjectText, undefined, body, reply_to, [attachment]);
    }

    res.json({
        error: null,
        data: { message: 'המיילים נשלחו בהצלחה' }
    })
}

export async function downloadOneExcelFile(req, res) {
    const { body: { id, type } } = req;
    const getExcelFunc = type === 'Att' ? getAttExcelBufferByLessonIdAsStream : getGradeExcelBufferByLessonIdAsStream;
    const { fileStream, filename } = await getExcelFunc(id, req.currentUser.id);
    downloadFileFromStream(fileStream, filename, 'xlsx', res);
}
