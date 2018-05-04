import { NgModule } from '@angular/core';
import {
  MatButtonModule,
  MatListModule,
  MatCardModule,
  MatDialogModule,
  MatExpansionModule,
  MatIconModule,
  MatInputModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatToolbarModule,
  MatTooltipModule,
  MatFormFieldModule,
  MatDividerModule,
  MatOptionModule,
  MatTabsModule,
  MatChipsModule,
  MatCheckboxModule,
  MatSliderModule
} from '@angular/material';

const modules = [
  MatButtonModule,
  MatCheckboxModule,
  MatSliderModule,
  MatListModule,
  MatCardModule,
  MatDialogModule,
  MatExpansionModule,
  MatIconModule,
  MatInputModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatToolbarModule,
  MatTooltipModule,
  MatFormFieldModule,
  MatDividerModule,
  MatOptionModule,
  MatTabsModule,
  MatChipsModule
];

@NgModule({
  imports: modules,
  exports: modules
})
export class MaterialModule { }
