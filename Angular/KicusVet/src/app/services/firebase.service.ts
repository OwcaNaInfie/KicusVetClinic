import { Injectable } from '@angular/core';
import {
  Database,
  push,
  ref,
  set,
  get,
  remove,
  update,
} from '@angular/fire/database';
import { Observable } from 'rxjs';
import { onValue } from 'firebase/database';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(private db: Database) {}

  async addObjectWithAutoID(path: string, data: any): Promise<void> {
    const dbRef = ref(this.db, path);
    const newRef = push(dbRef);
    await set(newRef, data);
  }

  getObjectList(path: string): Observable<any[]> {
    const dbRef = ref(this.db, path);
    return new Observable((observer) => {
      onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        const objectList = data
          ? Object.entries(data).map(([id, value]) => ({
              id,
              ...(value as object),
            }))
          : [];

        observer.next(objectList);
      });
    });
  }

  async updateObject(path: string, id: string, data: any): Promise<void> {
    const dbRef = ref(this.db, `${path}/${id}`);
    await update(dbRef, data);
  }

  async deleteObject(path: string, id: string): Promise<void> {
    const dbRef = ref(this.db, `${path}/${id}`);
    await remove(dbRef);
  }
}
