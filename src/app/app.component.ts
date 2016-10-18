import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  program = 'addi $s0, $0, 10\naddi $s1, $0, 30\naddd $s2, $s0, 31';

  getProgram():string {
      return this.program;
  }
}
