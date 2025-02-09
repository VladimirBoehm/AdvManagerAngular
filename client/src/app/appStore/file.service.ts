import { Injectable } from '@angular/core';
import { DBConfig, NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom } from 'rxjs';
export const dbConfig: DBConfig = {
  name: 'MyDb',
  version: 1,
  objectStoresMeta: [
    {
      store: 'files',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'name', keypath: 'name', options: { unique: false } },
        { name: 'data', keypath: 'data', options: { unique: false } },
        { name: 'type', keypath: 'type', options: { unique: false } },
        {
          name: 'lastModified',
          keypath: 'lastModified',
          options: { unique: false },
        },
      ],
    },
  ],
};

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(private dbService: NgxIndexedDBService) {}

  saveFile(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileData = reader.result as ArrayBuffer;
        const fileRecord = {
          id: 1,
          name: file.name,
          data: fileData,
          type: file.type,
          lastModified: file.lastModified,
        };

        firstValueFrom(this.dbService.update('files', fileRecord))
          .then(
            (fileRecord: {
              name: string;
              data: ArrayBuffer;
              type: string;
              lastModified: number;
              id: number;
            }) => {
              console.log(`File "${file.name}" saved successfully`);
              resolve(fileRecord.id);
            }
          )
          .catch((error: any) => {
            console.error('File save error:', error);
            reject(error);
          });
      };

      reader.onerror = (error) => {
        console.error('File read error:', error);
        reject(error);
      };

      reader.readAsArrayBuffer(file);
    });
  }

  getFirst(): Promise<any> {
    return firstValueFrom(this.dbService.getByKey('files', 1));
  }

  deleteAll() {
    firstValueFrom(this.dbService.clear('files'));
  }
}
