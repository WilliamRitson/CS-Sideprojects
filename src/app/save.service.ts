import { Injectable} from '@angular/core';


const base_location = 'cs-data-'



@Injectable()
export class SaveService {

  constructor() { }

  load(unloader: (Object) => void, tag: string) {
    let loaded = this.getData(tag)
    if (loaded != undefined) {
      unloader(loaded);
    }
  }

  getData(tag: string): Object {
    try {
      return JSON.parse(localStorage.getItem(base_location + tag));
    } catch (e) {
      return undefined;
    }
  }

  save(data: Object, tag: string) {
    localStorage.setItem(base_location + tag, JSON.stringify(data));
  }

  handle: NodeJS.Timer;
  autosave(getData: () => Object, tag: string, interval: number = 10000) {
    this.handle = setInterval(() => {
      this.save(getData(), tag);
    }, interval);
  }

  removeAutosave() {
    clearInterval(this.handle);
  }

}
