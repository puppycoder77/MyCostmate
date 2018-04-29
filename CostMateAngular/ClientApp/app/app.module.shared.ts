import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { UserModule } from "./user.module";
import { ModalModule, AlertModule, CarouselModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { ShareButtonsModule } from 'ngx-sharebuttons';
import { TimeAgoPipe } from 'time-ago-pipe';
import 'firebase/database';  //Need these import to be able to use firebase.database() method in any component.


import { AppComponent } from './components/app/app.component';
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { HomeComponent } from './components/home/home.component';
import { FetchDataComponent } from './components/fetchdata/fetchdata.component';
import { CounterComponent } from './components/counter/counter.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ItemDetailComponent } from "./components/item-detail/item-detail.component";
import { ContactComponent } from "./components/contact/contact.component";
import { LoginComponent } from "./components/login/login.component";
import { RegisterComponent } from "./components/register/register.component";
import { CategorySearchResultComponent } from "./components/category-search-result/category-search-result.component";
import { StateSearchResultComponent } from "./components/state-search-result/state-search-result.component";
import { AddNewItemComponent } from "./components/add-new-item/add-new-item.component";
import { AngularFireModule} from 'angularfire2';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import { UserDetailsFromFirebaseService } from "./Services/user-details-from-firebase.service";
import { AuthGuard } from "./Guards/auth-guard.service";
import { ApiService } from "./Services/api.service";
import { StateSearchResultResolverService } from "./Services/state-search-resolver.service";
import { HomePageResolverService } from "./Services/home-page-resolver.service";
import { ItemDetailResolverService } from "./Services/item-detail-resolver.service";
import { EscapeHtmlPipe } from "./Pipes/safe-html.pipe";
import { EmhndlComponent } from "./components/emhndl/emhndl.component";
import {ForgotpswdComponent} from "./components/forgotpswd/forgotpswd.component";
//import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';


export const firebaseConfig = {
    apiKey: "mykey",
    authDomain: "myauthdomain",
    databaseURL: "my databaseURL",
    projectId: "my project id",
    storageBucket: "my storage bucket",
    messagingSenderId: "my messagingsenderid"
};

const ROUTES = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent, resolve: { homePageDataResv: HomePageResolverService } },
    { path: 'counter', component: CounterComponent },
    //{ path: 'fetch-data', component: FetchDataComponent, canActivate: [AuthGuard], },
    { path: 'newitem', component: AddNewItemComponent },
    { path: 'item/:id', component: ItemDetailComponent },
    { path: 'contact', component: ContactComponent },
    { path: 'signin', component: LoginComponent },
    { path: 'signup', component: RegisterComponent },
    { path: 'emhndl', component: EmhndlComponent },
    { path: 'forgotpswd', component: ForgotpswdComponent },

    { path: 'categories/:catname', component: CategorySearchResultComponent },
    { path: 'categories/:catname/:statename', component: CategorySearchResultComponent },
    { path: 'state/:statename', component: StateSearchResultComponent, resolve: { stateItemDataResv: StateSearchResultResolverService }  },
    { path: ':state/:statename/:catname', component: StateSearchResultComponent, resolve: { stateItemDataResv: StateSearchResultResolverService } },
    { path: ':state/:statename/:catname/:id', component: ItemDetailComponent, resolve: { itemDetailDataResv: ItemDetailResolverService } },
    { path: 'nomatch', component: PageNotFoundComponent },
    { path: '**', component: PageNotFoundComponent }
]

@NgModule({
    declarations: [
        AppComponent,
        AddNewItemComponent,
        HomeComponent,
        NavMenuComponent,
        CounterComponent,
        FetchDataComponent,
        PageNotFoundComponent,
        ItemDetailComponent,
        ContactComponent,
        LoginComponent,
        RegisterComponent,
        CategorySearchResultComponent,
        StateSearchResultComponent,
        ForgotpswdComponent,
        EmhndlComponent,
        EscapeHtmlPipe,
        TimeAgoPipe
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        HttpModule,
        FormsModule,
        RouterModule.forRoot(ROUTES),
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFireAuthModule,
        UserModule,
        ModalModule.forRoot(),
        AlertModule.forRoot(),
        CarouselModule.forRoot(),
        ShareButtonsModule.forRoot(),
        NgxPaginationModule
    ],
    providers: [AngularFireAuth, UserDetailsFromFirebaseService, AuthGuard, ApiService, StateSearchResultResolverService, HomePageResolverService, ItemDetailResolverService]
})
export class AppModuleShared {
}