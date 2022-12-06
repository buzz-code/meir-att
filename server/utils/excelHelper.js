import path from 'path';
import { Readable } from 'stream';
import { renderExcelTemplate } from "../../common-modules/server/utils/template";
import { templatesDir } from "./printHelper";
import { getTemplateDataByLessonId } from "./queryHelper";

const getFilenameFromTemplateData = ({ }) => `דוח נוכחות למלא`;
const getFilenameFromTemplateDataWithExt = ({ }) => `${getFilenameFromTemplateData({})}.xlsx`;

export async function getAttExcelBufferByLessonId(lessonId, userId) {
    const templatePath = path.join(templatesDir, `att_report-${userId}.xlsx`);
    const templateData = await getTemplateDataByLessonId(lessonId);
    const fileBuffer = await renderExcelTemplate(templatePath, templateData);
    const filename = getFilenameFromTemplateDataWithExt(templateData);
    return { fileBuffer, filename, templateData };
}

export async function getAttExcelBufferByLessonIdAsStream(lessonId, userId) {
    const { fileBuffer, filename, templateData } = await getAttExcelBufferByLessonId(lessonId, userId);
    return {
        filename: getFilenameFromTemplateData(templateData),
        templateData,
        fileStream: Readable.from(fileBuffer)
    };
}