import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import temp from 'temp';
import PDFMerger from 'pdf-merger-js';
import { streamToBuffer } from '@jorgeferrero/stream-to-buffer';
import hebcal from 'hebcal';
import { getFileName, getPdfStreamFromHtml, renderEjsTemplate } from '../../common-modules/server/utils/template';
import { getDiaryDataByGroupId, getStudentReportData } from './queryHelper';
import constant from '../../common-modules/server/config/directory';

temp.track();

export const templatesDir = path.join(__dirname, '..', '..', 'public', 'templates');

const getFilenameFromGroup = ({ klass, teacher, lesson }) => `יומן נוכחות ${klass?.name || ''}_${teacher?.name || ''}_${lesson?.name || ''}`;

const getMonthName = (month) => {
    switch (month) {
        case 1: return 'ניסן';
        case 2: return 'אייר';
        case 3: return 'סיוון';
        case 4: return 'תמוז';
        case 5: return 'אב';
        case 6: return 'אלול';
        case 7: return 'תשרי';
        case 8: return 'חשוון';
        case 9: return 'כסלו';
        case 10: return 'טבת';
        case 11: return 'שבט';
        case 12: return 'אדר';
        case 13: return 'אדר ב';
    }
}

const loadFileData = async (type, pathArr) => {
    const filePath = path.join(constant.assetsDir, ...pathArr);
    if (!fs.existsSync(filePath)) {
        return '';
    }
    return `data:${type};base64,${await fs.promises.readFile(filePath, { encoding: 'base64' })}`;
}

const addMetadataToTemplateData = async (templateData, title, diaryDate = null, isWithDate = true, headerUrl = 'header.jpg') => {
    if (isWithDate) {
        const heDate = new hebcal.HDate(diaryDate ? new Date(diaryDate) : new Date());
        templateData.title = title + '- ' + getMonthName(heDate.month) + ' ' + hebcal.gematriya(heDate.year);
    } else {
        templateData.title = title;
    }
    templateData.font = await loadFileData('font/truetype', ['fonts', 'ELEGANTIBOLD.TTF']);
    templateData.img = await loadFileData('image', ['img', headerUrl]);
}

export async function getDiaryStream(groupId, diaryDate) {
    const templatePath = path.join(templatesDir, "diary.ejs");
    const templateData = await getDiaryDataByGroupId(groupId);
    await addMetadataToTemplateData(templateData, 'יומן נוכחות', diaryDate);
    const html = await renderEjsTemplate(templatePath, templateData);
    const fileStream = await getPdfStreamFromHtml(html);
    const filename = getFilenameFromGroup(templateData.group);
    return { fileStream, filename };
}

export async function getDiaryZipStream(groups, diaryDate) {
    const archive = archiver('zip');
    var tempStream = temp.createWriteStream({ suffix: '.zip' });
    archive.pipe(tempStream);

    for await (const group of groups) {
        const { fileStream, filename } = await getDiaryStream(group.id, diaryDate);
        archive.append(fileStream, { name: getFileName(filename, 'pdf') });
    }
    await archive.finalize();
    tempStream.close();
    return { fileStream: fs.createReadStream(tempStream.path), filename: 'יומנים' };
}

export async function getDiaryMergedPdfStream(groups, diaryDate) {
    var merger = new PDFMerger();

    for (const group of groups) {
        const { fileStream, filename } = await getDiaryStream(group.id, diaryDate);
        const filePath = temp.path({ prefix: filename, suffix: '.pdf' });
        await fs.promises.writeFile(filePath, await streamToBuffer(fileStream));
        merger.add(filePath);
    }

    const tempPath = temp.path({ suffix: '.pdf' });
    await merger.save(tempPath);
    const fileStream = fs.createReadStream(tempPath);

    return { fileStream, filename: 'יומנים' };
}

function getStudentReportHeader(user_id) {
    const imageName = `user-${user_id}.png`;
    if (fs.existsSync(path.join(constant.assetsDir, 'img', imageName))) {
        return imageName;
    }
    return 'header.jpg';
}

export async function getStudentReportStream(student_tz, klass_id, user_id, reportParams) {
    const templatePath = path.join(templatesDir, "student-report.ejs");
    const templateData = await getStudentReportData(student_tz, klass_id, user_id);
    templateData.reportParams = reportParams;
    const userHeaderImage = getStudentReportHeader(user_id);
    await addMetadataToTemplateData(templateData, 'סיכום נוכחות', null, false, userHeaderImage);
    const html = await renderEjsTemplate(templatePath, templateData);
    const fileStream = await getPdfStreamFromHtml(html);
    const filename = 'דוח לתלמידה ' + templateData.student.name;
    return { fileStream, filename };
}

export async function getStudentReportMergedPdfStream(ids, klass_id, user_id, reportParams) {
    var merger = new PDFMerger();

    for (const id of ids) {
        const { fileStream, filename } = await getStudentReportStream(id, klass_id, user_id, reportParams);
        const filePath = temp.path({ prefix: filename, suffix: '.pdf' });
        await fs.promises.writeFile(filePath, await streamToBuffer(fileStream));
        merger.add(filePath);
    }

    const tempPath = temp.path({ suffix: '.pdf' });
    await merger.save(tempPath);
    const fileStream = fs.createReadStream(tempPath);

    return { fileStream, filename: 'דוחות' };
}
