import { CallBase } from "../../common-modules/server/utils/callBase";
import format from 'string-format';
import * as queryHelper from './queryHelper';
import { AttReport, Grade } from "../models";

export class YemotCall extends CallBase {
    constructor(params, callId, user) {
        super(params, callId, user);
    }

    async start() {
        await this.getTexts();
        try {
            const teacher = await queryHelper.getTeacherByUserIdAndPhone(this.user.id, this.params.ApiPhone);
            if (!teacher) {
                await this.send(
                    this.id_list_message({ type: 'text', text: this.texts.phoneIsNotRecognizedInTheSystem }),
                    this.hangup()
                );
            }
            const lesson = await this.getLesson(teacher);
            const klass = await this.getKlass(lesson);
            this.params.baseReport = {
                user_id: this.user.id,
                teacher_id: teacher.tz,
                klass_id: klass.key,
                lesson_id: lesson.key,
                report_date: new Date().toISOString().substr(0, 10),
            };

            await this.send(
                this.read({ type: 'text', text: this.texts.getReportType },
                    'reportType', 'tap', { max: 1, min: 1, block_asterisk: true })
            );
            if (this.params.reportType === '1') {
                await this.getStudentReports();
            }
            else if (this.params.reportType === '2') {
                await this.getStudentGrades();
            }
            try {
                // for (const studentId in this.params.studentReports) {
                // }
                await this.send(
                    this.id_list_message({ type: 'text', text: this.texts.dataWasSavedSuccessfully }),
                    this.hangup()
                );
            }
            catch (e) {
                console.log('catch yemot exception', e);
                await this.send(
                    this.id_list_message({ type: 'text', text: this.texts.dataWasNotSaved }),
                    this.hangup()
                );
            }
        }
        catch (e) {
            if (e) {
                console.log('catch yemot exception', e);
            }
        } finally {
            this.end();
        }
    }

    async getKlass(lesson, isRetry = false) {
        if (!lesson?.klasses || lesson.klasses.includes(',')) {
            let message = '';
            if (!isRetry) {
                message = this.texts.welcomeAndTypeKlassId;
            } else {
                message = this.texts.tryAgain;
            }
            await this.send(
                this.read({ type: 'text', text: message },
                    'klassId', 'tap', { max: 9, min: 1, block_asterisk: true })
            );
        } else {
            this.params.klassId = lesson.klasses;
        }
        let klass = await queryHelper.getKlassByUserIdAndKlassId(this.user.id, this.params.klassId);
        if (klass) {
            await this.send(
                this.read({ type: 'text', text: format(this.texts.confirmKlass, klass.name) },
                    'klassConfirm', 'tap', { max: 1, min: 1, block_asterisk: true })
            );
            if (this.params.klassConfirm === '2') {
                return this.getKlass(null, true);
            }
        } else {
            await this.send(this.id_list_message({ type: 'text', text: this.texts.klassIdNotFound }));
            return this.getKlass(null, true);
        }
        return klass;
    }

    async getLesson(teacher, isRetry = false) {
        const message = isRetry ? this.texts.tryAgain : format(this.texts.typeLessonId, teacher.name);
        await this.send(
            this.read({ type: 'text', text: message },
                'lessonId', 'tap', { max: 9, min: 1, block_asterisk: true })
        );
        let lesson = await queryHelper.getLessonByUserIdAndLessonId(this.user.id, this.params.lessonId);
        if (lesson) {
            await this.send(
                this.read({ type: 'text', text: format(this.texts.confirmLesson, lesson.name) },
                    'lessonConfirm', 'tap', { max: 1, min: 1, block_asterisk: true })
            );
            if (this.params.lessonConfirm === '2') {
                return this.getLesson(true);
            }
        } else {
            await this.send(this.id_list_message({ type: 'text', text: this.texts.lessonIdNotFound }));
            return this.getLesson(true);
        }
        return lesson;
    }

    async getStudentReports() {
        const { idsToSkip, existingReports } = await this.askExistingReports('att');

        await this.getSheetName();

        await this.getHowManyLessons();

        await this.askForStudentData(idsToSkip, existingReports, async (student, isFirstTime, handleAsterisk, existing) => {
            await this.send(
                isFirstTime ? this.id_list_message({ type: 'text', text: this.texts.startStudentList }) : undefined,
                this.read({ type: 'text', text: student.name + ': ' + this.texts.typeAbsences },
                    'absCount', 'tap', { max: 1, min: 1, block_asterisk: false })
            );
            if (await handleAsterisk('absCount')) {
                throw new Error('abort saving current student');
            }

            if (existing.length > 0) {
                await new AttReport({ id: existing[0].id }).destroy();
            }

            const attReport = {
                ...this.params.baseReport,
                how_many_lessons: this.params.howManyLessons,
                student_tz: student.tz,
                abs_count: this.params.absCount,
                approved_abs_count: this.params.approvedAbsCount || '0',
                comments: '',
                sheet_name: this.sheetName,
            };
            await new AttReport(attReport).save();
        });
    }

    async getStudentGrades() {
        const { idsToSkip, existingReports } = await this.askExistingReports('grades')

        await this.getSheetName();

        await this.getHowManyLessons();

        await this.askForStudentData(idsToSkip, existingReports, async (student, isFirstTime, handleAsterisk, existing) => {
            await this.send(
                isFirstTime ? this.id_list_message({ type: 'text', text: this.texts.startStudentList }) : undefined,
                this.read({ type: 'text', text: student.name + ': ' + this.texts.typeGrade },
                    'grade', 'tap', { max: 3, min: 1, block_asterisk: false, sec_wait: 3 })
            );
            if (await handleAsterisk('grade')) {
                throw new Error('abort saving current student');
            }

            if (existing.length > 0) {
                await new Grade({ id: existing[0].id }).destroy();
            }

            const dataToSave = {
                ...this.params.baseReport,
                how_many_lessons: this.params.howManyLessons,
                student_tz: student.tz,
                grade: this.params.grade,
                comments: '',
            };
            await new Grade(dataToSave).save();
        });
    }

    async askExistingReports(reportType) {
        let existingReports = [];
        if (reportType === 'grades') {
            existingReports = await queryHelper.getExistingGrades(this.user.id, this.params.baseReport.klass_id, this.params.baseReport.lesson_id);
        } else if (reportType === 'att') {
            existingReports = await queryHelper.getExistingReport(this.user.id, this.params.baseReport.klass_id, this.params.baseReport.lesson_id);
        }

        let idsToSkip = new Set();
        if (existingReports.length > 0) {
            await this.send(
                this.read({ type: 'text', text: this.texts.askIfSkipExistingReports },
                    'isSkipExistingReports', 'tap', { max: 1, min: 1, block_asterisk: true })
            );

            if (this.params.isSkipExistingReports == '1') {
                idsToSkip = new Set(existingReports.map(item => item.student_tz));
            }
        }

        return { existingReports, idsToSkip };
    }

    async getSheetName() {
        const currentMonth = this.getMonthName(new Date().getMonth() + 1);

        await this.send(
            this.read({ type: 'text', text: format(this.texts.askIsCurrentMonth, currentMonth) },
                'isCurrentMonth', 'tap', { max: 1, min: 1, block_asterisk: false })
        );

        if (this.params.isCurrentMonth == 1) {
            this.sheetName = currentMonth;
        } else {
            await this.send(
                this.read({ type: 'text', text: this.texts.askForCurrentMonth },
                    'currentMonth', 'tap', { max: 2, min: 1, block_asterisk: false })
            );
            this.sheetName = this.getMonthName(Number(this.params.currentMonth));
        }
    }

    getMonthName(number) {
        const date = new Date(2009, number - 1, 1);  // 2009-11-10
        const month = date.toLocaleString('he', { month: 'long' });
        return month;
    }

    async getHowManyLessons() {
        await this.send(
            this.read({ type: 'text', text: this.texts.howManyLessons },
                'howManyLessons', 'tap', { max: 2, min: 1, block_asterisk: true, sec_wait: 2 })
        );
    }

    async askForStudentData(idsToSkip, existingReports, callback) {
        const studentList = await queryHelper.getStudentsByUserIdAndKlassIds(this.user.id, this.params.baseReport.klass_id);
        const students = studentList.filter(item => !idsToSkip.has(item.tz));

        let isFirstTime = true;
        this.params.studentReports = {};
        let index = 0;

        async function handleAsterisk(field) {
            if (this.params[field] == '*') {
                await this.send(
                    this.read({ type: 'text', text: this.texts.sideMenu },
                        'sideMenu', 'tap', { max: 1, min: 1, block_asterisk: true })
                );
                if (this.params.sideMenu == '4') {
                    if (index > 0) {
                        index--;
                    }
                    return true;
                } else if (this.params.sideMenu == '6') {
                    index++;
                    return true;
                } else {
                    this.params[field] = '0';
                }
            }
            return false;
        }

        handleAsterisk = handleAsterisk.bind(this);

        while (index < students.length) {
            const student = students[index];
            const existing = existingReports.filter(item => item.student_tz == student.tz);

            try {
                await callback(student, isFirstTime, handleAsterisk, existing)
                index++;
            } finally {
                isFirstTime = false;
            }
        }
    }
}