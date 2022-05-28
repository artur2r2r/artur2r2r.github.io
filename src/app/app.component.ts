import { Component } from '@angular/core';
import { NgxFileDropEntry } from "ngx-file-drop";
import { TagModel } from "ngx-chips/core/tag-model";
import { PdfReaderService } from "../services/pdf-reader.service";

interface NgxFileDropEntryExtended extends NgxFileDropEntry {
  pdfSource: Uint8Array;
  visible: boolean;
  zoom: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public files: NgxFileDropEntryExtended[] = [];
  items: TagModel[] = [];
  found = false;
  initialZoomSet: boolean = false;
  zoom$: number = 0;

  constructor(private pdfReader: PdfReaderService) {
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files as any;

    this.reset();
    for (let i = 0; i < this.files.length; i++) {
      const droppedFile = this.files[i];
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          file.arrayBuffer()
            .then(v => {
              this.files[i].pdfSource = new Uint8Array(v);
              this.files[i].zoom = 0;
            })
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }

  public fileOver(event: any) {
    console.log(event);
  }

  public fileLeave(event: any) {
    console.log(event);
  }

  public changePage(page: any, data: Array<any>): Array<any> {
    let start = (page.page - 1) * page.itemsPerPage;
    let end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length;
    return data.slice(start, end);
  }

  onItemAdded($event: TagModel) {
    this.processPdf($event);
  }

  onItemRemoved($event: TagModel) {
    this.processPdf($event);
    if (this.items?.length === 0) {
      this.reset();
    }
  }

  reset() {
    this.files.forEach(v => v.visible = true)
  }

  // pageRendered(ev: CustomEvent<any>) {
  //   if (this.initialZoomSet) {
  //     return;
  //   }
  //
  //   this.initialZoomSet = true;
  //   @ts-ignore
  // const width = ev.source.div.clientWidth;
  // @ts-ignore
  // const height = ev.source.div.clientHeight;
  // const ratio = width / height;
  // const targetHeight = 384;
  // const requiredWidth = ratio * targetHeight;
  // const scale = requiredWidth / width;
  // this.setState('zoom', scale);
  // }

  increaseZoom(item: NgxFileDropEntryExtended) {
    item.zoom += 0.1;
  }

  decreaseZoom(item: NgxFileDropEntryExtended) {
    item.zoom -= 0.1;
  }

  private processPdf($event: TagModel) {
    this.files.forEach(v => {
      const fileEntry = v.fileEntry as FileSystemFileEntry;
      fileEntry.file(async f => {
        this.pdfReader.readPdf(v.pdfSource)
          .then(text => {
            console.log('PDF parsed: ', text);
            // @ts-ignore
            const found: RegExpMatchArray = text.match(new RegExp($event.display, 'gi'));
            this.found = found?.length > 0;
            v.visible = found?.length > 0;
          })
          .catch(reason => {
            console.error(reason)
          });
      });
    }, (_: any) => {
    })
  }

  private setState(zoom: string, scale: number) {
    this.zoom$ = scale;
  }
}

// onInputTextChange($event: TagModel) {
//   if (!this.files) {
//     return;
//   }
//   this.files.forEach(v => {
//     const fileEntry = v.fileEntry as FileSystemFileEntry;
//
//     this.pdfReader.readPdf(fileEntry.fullPath)
//       .then(text => {
//         console.log('PDF parsed: ', text);
//         // @ts-ignore
//         this.found = text.indexOf(this.items[0]['display']) > 1;
//         // alert('PDF parsed: ' + text);
//       })
//       .catch(reason => {
//         console.error(reason)
//       });
//   })
// }
