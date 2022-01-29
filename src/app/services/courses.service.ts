import {Injectable} from '@angular/core';
import {from, Observable} from 'rxjs';
import {Course} from '../model/course';
import {AngularFirestore} from '@angular/fire/firestore';
import {concatMap, map} from 'rxjs/operators';
import {convertSnaps} from './db-util';

@Injectable({
    providedIn: 'root'
})
export class CoursesService {

    constructor(private db: AngularFirestore) {
    }

    updateCourse(courseId: string, changes: Partial<Course>): Observable<any> {
        return from(this.db.doc(`courses/${courseId}`).update(changes));
    }

    deleteCourse(courseId: string) {
        return from(this.db.doc(`courses/${courseId}`).delete());
    }

    createCourse(newCourse: Partial<Course>, courseId?: string) {
        return this.db.collection('courses',
            ref => ref.orderBy('seqNo', 'desc').limit(1))
            .get()
            .pipe(
                concatMap(result => {

                    const courses = convertSnaps<Course>(result);

                    const lastCourseSeqNo = courses[0]?.seqNo ?? 0;

                    const course = {
                        ...newCourse,
                        seqNo: lastCourseSeqNo + 1
                    };

                    let save$: Observable<any>;

                    if (courseId) {
                        save$ = from(this.db.doc(`courses/${courseId}`).set(course));
                    } else {
                        save$ = from(this.db.collection('courses').add(course));
                    }

                    return save$
                        .pipe(
                            map(res => {
                                return {
                                    id: courseId ?? res.id,
                                    ...course
                                };
                            })
                        );


                })
            );
    }

    loadCoursesByCategory(category: string): Observable<Course[]> {
        return this.db.collection('courses',
            ref => ref.where('categories', 'array-contains', category)
                // "array-contains" filter conditions in a Query.where() clause are specified using the strings
                // '', '=', '==', '!=', '>=', '>', 'array-contains', 'in', 'array-contains-any', and 'not-in'.
                .orderBy('seqNo')
        )
            .get()
            .pipe(
                // tap(result => (result.docs.map(res => console.log('res.id', res.data())))),
                map(result => convertSnaps<Course>(result))
            );
    }
}
