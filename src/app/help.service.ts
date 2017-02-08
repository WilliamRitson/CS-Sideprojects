import { Injectable } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';

@Injectable()
export class HelpService {

  helpUrl: string;

  constructor(private router: Router) {
    router.events.subscribe((val) => {
      console.log(val);
      if (val instanceof RoutesRecognized)
        this.helpUrl = undefined;
    });
  }

 
  gotoHelpUrl() {
    window.open(this.helpUrl, '_blank');
  }

  setHelpUrl(url: string) {
    console.log(url);
    this.helpUrl = url;
  }
}
