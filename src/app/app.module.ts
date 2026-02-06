import { AboutComponent } from './about/about.component';
import { AlignmentDirective } from './alignment.directive';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { DemonDetailsComponent } from './demon-details/demon-details.component';
import { DemonListComponent } from './demon-list/demon-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FusionComponent } from './fusion/fusion.component';
import { FusionDetailsComponent } from './fusion-details/fusion-details.component';
import { FusionGraphComponent } from './fusion-graph/fusion-graph.component';
import { ImageTooltipDirective } from './image-tooltip.directive';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgModule } from '@angular/core';
import { PlayerDetailsComponent } from './player-details/player-details.component';

@NgModule({
  declarations: [
    AppComponent,
    DemonListComponent,
    DemonDetailsComponent,
    PlayerDetailsComponent,
    FusionComponent,
    FusionDetailsComponent,
    FusionGraphComponent,
    AlignmentDirective,
    ImageTooltipDirective,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatSortModule,
    MatInputModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSelectModule,
    MatMenuModule,
    MatSnackBarModule,
    MatAutocompleteModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
