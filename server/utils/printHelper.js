import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import temp from 'temp';
import PDFMerger from 'pdf-merger-js';
import { streamToBuffer } from '@jorgeferrero/stream-to-buffer';
import hebcal from 'hebcal';
import { getFileName, getPdfStreamFromHtml, renderEjsTemplate } from '../../common-modules/server/utils/template';
import { getDiaryDataByGroupId } from './queryHelper';
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

const addMetadataToTemplateData = async (templateData, title, diaryDate) => {
    const heDate = new hebcal.HDate(diaryDate ? new Date(diaryDate) : new Date());
    templateData.title = title + '- ' + getMonthName(heDate.month) + ' ' + hebcal.gematriya(heDate.year);
    templateData.font = 'data:font/truetype;base64,' + await fs.promises.readFile(path.join(constant.assetsDir, 'fonts', 'ELEGANTIBOLD.TTF'), { encoding: 'base64' });
    templateData.img = 'data:image;base64,' + await fs.promises.readFile(path.join(constant.assetsDir, 'img', 'header.jpg'), { encoding: 'base64' });
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
