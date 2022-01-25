import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Course} from '../model/course';
import {AngularFirestore} from '@angular/fire/firestore';
import {map, tap} from 'rxjs/operators';
import {convertSnaps} from './db-util';

@Injectable({
    providedIn: 'root'
})
export class CoursesService {

    constructor(private db: AngularFirestore) {
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
