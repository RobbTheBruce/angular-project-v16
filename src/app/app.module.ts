import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InitialRequestComponent } from './pages/initial-request/initial-request.component';
import { RequestedItemComponent } from './pages/requested-item/requested-item.component';
import { MockDataService } from './mocks/mock-data.service';
import { ButtonComponent } from './components/button/button.component';
import { RadioComponent } from './components/radio/radio.component';
import { ListComponent } from './components/list/list.component';
import { TextInputComponent } from './components/text-input/text-input.component';
import { DynamicSectionComponent } from './components/dynamic-section/dynamic-section.component';
import { VendorInfoComponent } from './pages/vendor-info/vendor-info.component';
import { SummaryComponent } from './pages/summary/summary.component';

@NgModule({
  declarations: [
    AppComponent,
    InitialRequestComponent,
    RequestedItemComponent,
    ButtonComponent,
    RadioComponent,
    ListComponent,
    TextInputComponent,
    DynamicSectionComponent,
    VendorInfoComponent,
    SummaryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientInMemoryWebApiModule.forRoot(MockDataService, { 
      dataEncapsulation: false,
      delay: 300 
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
