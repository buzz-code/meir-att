import Format from 'string-format';
import { Lesson, Teacher, Klass } from '../models';
import { getListFromTable } from '../../common-modules/server/utils/common';
import { getAttExcelBufferByLessonId, getAttExcelBufferByLessonIdAsStream } from '../utils/excelHelper';
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
    const { body: { ids } } = req;

    if (ids.length > 100) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: 'לא ניתן לשלוח יותר מ100 מיילים ביום'
        });
    }

    const { subjectText, bodyText } = await getEmailFieldsWithFile(req.currentUser.id);
    const { from_email, reply_to_email } = req.currentUser.toJSON();

    for (const id of ids) {
        const { fileBuffer, filename, templateData } = await getAttExcelBufferByLessonId(id, req.currentUser.id);
        const attachment = {
            content: fileBuffer.toString('base64'),
            filename,
        };
        const body = Format(bodyText, templateData.lesson.teacher.name, templateData.lesson.name);
        await sendEmail(templateData.lesson.teacher.email, from_email, subjectText, body, undefined, reply_to_email, [attachment]);
    }

    res.json({
        error: null,
        data: { message: 'המיילים נשלחו בהצלחה' }
    })
}

export async function downloadOneExcelFile(req, res) {
    const { body: { id } } = req;
    const { fileStream, filename } = await getAttExcelBufferByLessonIdAsStream(id, req.currentUser.id);
    downloadFileFromStream(fileStream, filename, 'xlsx', res);
}
