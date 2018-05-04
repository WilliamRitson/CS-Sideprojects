import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemorySimulatorComponent } from './memory-simulator/memory-simulator.component';
import { MemoryUnitEditorComponent } from './memory-unit-editor/memory-unit-editor.component';
import { RadixedValueEditorComponent } from './radixed-value-editor/radixed-value-editor.component';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from '../material.module';
import { FormsModule } from '@angular/forms';
import { RadixPipe, AllRadixPipe } from './radix.pipe';
import { SaveService } from './save.service';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    MaterialModule
  ],
  declarations: [
    MemorySimulatorComponent,
    MemoryUnitEditorComponent,
    RadixedValueEditorComponent,
    AllRadixPipe,
    RadixPipe
  ],
  providers: [SaveService],
  exports: [MemorySimulatorComponent]
})
export class MemoryModule { }
