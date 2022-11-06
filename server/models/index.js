import bookshelf from "../../common-modules/server/config/bookshelf";

function createModel(table, properties = {}) {
    return bookshelf.model(table, {
        tableName: table,
        ...properties
    })
}
export const User = createModel('users', {
    verifyPassword(password) {
        return this.get('password') === password;
    }
})

export const AttReportAndGrade = createModel('att_reports_and_grades', {
    user() {
        return this.belongsTo(User);
    },
    student() {
        return this.belongsTo(Student, 'student_tz', 'tz');
    },
    teacher() {
        return this.belongsTo(Teacher, 'teacher_id', 'tz');
    },
    lesson() {
        return this.belongsTo(Lesson, 'lesson_id', 'key');
    }
})

export const AttReport = createModel('att_reports', {
    user() {
        return this.belongsTo(User);
    },
    student() {
        return this.belongsTo(Student, 'student_tz', 'tz');
    },
    teacher() {
        return this.belongsTo(Teacher, 'teacher_id', 'tz');
    },
    lesson() {
        return this.belongsTo(Lesson, 'lesson_id', 'key');
    }
})


export const Grade = createModel('grades', {
    user() {
        return this.belongsTo(User);
    },
    student() {
        return this.belongsTo(Student, 'student_tz', 'tz');
    },
    teacher() {
        return this.belongsTo(Teacher, 'teacher_id', 'tz');
    },
    lesson() {
        return this.belongsTo(Lesson, 'lesson_id', 'key');
    }
})

export const Group = createModel('groups', {
    user() {
        return this.belongsTo(User);
    },
    klass() {
        return this.belongsTo(Klass, 'klass_id', 'key');
    },
    teacher() {
        return this.belongsTo(Teacher, 'teacher_id', 'tz');
    },
    lesson() {
        return this.belongsTo(Lesson, 'lesson_id', 'key');
    }
})

export const KlassType = createModel('klass_types', {
    user() {
        return this.belongsTo(User);
    }
})

export const Klass = createModel('klasses', {
    user() {
        return this.belongsTo(User);
    },
    klassType() {
        return this.belongsTo(KlassType);
    }
})

export const KnownAbsence = createModel('known_absences', {
    user() {
        return this.belongsTo(User);
    }
})

export const Lesson = createModel('lessons', {
    user() {
        return this.belongsTo(User);
    }
})

export const StudentKlass = createModel('student_klasses', {
    user() {
        return this.belongsTo(User);
    }
})

export const Student = createModel('students', {
    user() {
        return this.belongsTo(User);
    }
})

export const Teacher = createModel('teachers', {
    user() {
        return this.belongsTo(User);
    }
})

export const Text = createModel('texts', {
    user() {
        return this.belongsTo(User);
    }
})
