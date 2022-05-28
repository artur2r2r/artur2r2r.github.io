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
    this.resetVisibility();

    for (let i = 0; i < this.files.length; i++) {
      const droppedFile = this.files[i];
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          file.arrayBuffer()
            .then(v => {
              this.files[i].pdfSource = new Uint8Array(v);
              this.files[i].zoom = 1;
            })
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }


  public changePage(page: any, data: Array<any>): Array<any> {
    let start = (page.page - 1) * page.itemsPerPage;
    let end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length;
    return data.slice(start, end);
  }

  onItemAdded($event: TagModel) {
    this.processPdf($event);
  }

  onItemRemoved() {
    if (this.items?.length === 0) {
      this.resetVisibility();
    }
  }

  resetVisibility() {
    this.files.forEach(v => v.visible = true);
  }

  increaseZoom(item: NgxFileDropEntryExtended) {
    item.zoom += 0.1;
    item.zoom = +item.zoom.toFixed(1)
  }

  decreaseZoom(item: NgxFileDropEntryExtended) {
    item.zoom -= 0.1;
    item.zoom = +item.zoom.toFixed(1)
  }

  private processPdf($event: TagModel) {
    this.files.forEach(v => {
      this.pdfReader.readPdf(v.pdfSource)
        .then(text => {
          // console.log('PDF parsed: ', text);
          const found: RegExpMatchArray | null = text.match(new RegExp(($event as any).display, 'gi'));
          this.found = !!found && found.length > 0;
          v.visible = !!found && found.length > 0;
        })
        .catch(reason => {
          console.error(reason)
        })
    }, (_: any) => {
    })
  }
}
