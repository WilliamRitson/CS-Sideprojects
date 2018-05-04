import { Component } from '@angular/core';
import { HelpService } from './help.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  opened = false;
  
  constructor(public help: HelpService) { }

  gotoHelp() {
    this.help.gotoHelpUrl();
  }

  feedback() {
    window.open('mailto:william.ritson@gmail.com?subject=Website Feedback')
  }

}
