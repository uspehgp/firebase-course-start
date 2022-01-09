import {Component, OnInit} from '@angular/core';


import 'firebase/firestore';

import {AngularFirestore} from '@angular/fire/firestore';
import {COURSES, findLessonsForCourse} from './db-data';
import {Course} from '../model/course';


@Component({
    selector: 'about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})
export class AboutComponent {

    constructor(private db: AngularFirestore) {
    }

    async uploadData() {
        const coursesCollection = this.db.collection('courses');
        const courses = await this.db.collection('courses').get();
        for (let course of Object.values(COURSES)) {
            const newCourse = this.removeId(course);
            const courseRef = await coursesCollection.add(newCourse);
            const lessons = await courseRef.collection('lessons');
            const courseLessons = findLessonsForCourse(course['id']);
            console.log(`Uploading course ${course['description']}`);
            for (const lesson of courseLessons) {
                const newLesson = this.removeId(lesson);
                delete newLesson.courseId;
                await lessons.add(newLesson);
            }
        }
    }

    removeId(data: any) {
        const newData: any = {...data};
        delete newData.id;
        return newData;
    }


    onReadDoc() {
        this.db.doc('/courses/0Tny4K7JbR2nc9ZQx0c4').get().subscribe(
            snap => {
                // console.log(snap.id);
                console.log(snap.data());

            }
        );
        this.db.collection('courses').get().subscribe(
            snaps => {
                // console.log(snaps);
                console.log(snaps.docs.map(snap => snap.data()));
                // const courses: Course[] = snap.docs
            }
        );

    }
}
















