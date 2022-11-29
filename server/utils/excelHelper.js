import path from 'path';
import { renderExcelTemplate } from "../../common-modules/server/utils/template";
import { templatesDir } from "./printHelper";
import { getTemplateDataByLessonId } from "./queryHelper";

const getFilenameFromTemplateData = ({ }) => `דוח נוכחות למלא.xlsx`;

export async function getAttExcelBufferByLessonId(lessonId, userId) {
    const templatePath = path.join(templatesDir, `att_report-${userId}.xlsx`);
    const templateData = await getTemplateDataByLessonId(lessonId);
    const fileBuffer = await renderExcelTemplate(templatePath, templateData);
    const filename = getFilenameFromTemplateData(templateData);
    return { fileBuffer, filename, templateData };
}
