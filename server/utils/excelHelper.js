import path from 'path';
import { Readable } from 'stream';
import { renderExcelTemplate } from "../../common-modules/server/utils/template";
import { templatesDir } from "./printHelper";
import { getTemplateDataByLessonId } from "./queryHelper";

const getAttFilenameFromTemplateData = ({ lesson }) => `דוח נוכחות למלא ${lesson?.teacher?.name || ''} ${lesson?.name || ''} ${lesson?.klasses || ''}`;
const getAttFilenameFromTemplateDataWithExt = (data) => `${getAttFilenameFromTemplateData(data)}.xlsx`;

const getGradeFilenameFromTemplateData = ({ lesson }) => `דוח ציונים למלא ${lesson?.teacher?.name || ''} ${lesson?.name || ''} ${lesson?.klasses || ''}`;
const getGradeFilenameFromTemplateDataWithExt = (data) => `${getGradeFilenameFromTemplateData(data)}.xlsx`;

export async function getAttExcelBufferByLessonId(lessonId, userId) {
    const templatePath = path.join(templatesDir, `att_report-${userId}.xlsx`);
    const templateData = await getTemplateDataByLessonId(lessonId);
    const fileBuffer = await renderExcelTemplate(templatePath, templateData);
    const filename = getAttFilenameFromTemplateDataWithExt(templateData);
    return { fileBuffer, filename, templateData };
}

export async function getAttExcelBufferByLessonIdAsStream(lessonId, userId) {
    const { fileBuffer, filename, templateData } = await getAttExcelBufferByLessonId(lessonId, userId);
    return {
        filename: getAttFilenameFromTemplateData(templateData),
        templateData,
        fileStream: Readable.from(fileBuffer)
    };
}

export async function getGradeExcelBufferByLessonId(lessonId, userId) {
    const templatePath = path.join(templatesDir, `grades.xlsx`);
    const templateData = await getTemplateDataByLessonId(lessonId);
    const fileBuffer = await renderExcelTemplate(templatePath, templateData);
    const filename = getGradeFilenameFromTemplateDataWithExt(templateData);
    return { fileBuffer, filename, templateData };
}

export async function getGradeExcelBufferByLessonIdAsStream(lessonId, userId) {
    const { fileBuffer, filename, templateData } = await getGradeExcelBufferByLessonId(lessonId, userId);
    return {
        filename: getGradeFilenameFromTemplateData(templateData),
        templateData,
        fileStream: Readable.from(fileBuffer)
    };
}