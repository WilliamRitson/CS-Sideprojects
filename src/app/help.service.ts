import { Injectable } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';

@Injectable()
export class HelpService {

  helpUrl: string;

  constructor(private router: Router) {
    router.events.subscribe((val) => {
      if (val instanceof RoutesRecognized)
        this.helpUrl = undefined;
    });
  }
 
  gotoHelpUrl() {
    window.open(this.helpUrl, '_blank');
  }

  setHelpUrl(url: string) {
    this.helpUrl = url;
  }
}
