import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
   program = `lw r3, r2
mul r4, r3, r3
mul r3, r3, r1
addiu r0, r0, 1
div r3, r4, r3
sw r3, r2
addiu r2, r2, 4
bne r0, r1, -8`;
   getProgram: () => string;
   ngOnInit() {
     this.getProgram = (() => this.program).bind(this);
     console.log(this.getProgram);
   }
}
