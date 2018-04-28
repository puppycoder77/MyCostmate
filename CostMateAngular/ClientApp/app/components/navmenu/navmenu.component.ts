import { Component, OnInit, ElementRef, ViewChild, Renderer2, HostListener, TemplateRef, AfterViewChecked, ChangeDetectorRef, ApplicationRef, NgZone, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import * as $ from 'jquery';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/throttleTime';
import { ApiService } from "../../Services/api.service";
import { MateItemClient } from "../../Models/MateItemClient";
import { Utility } from "../../Models/Utility";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: 'nav-menu',
    templateUrl: './navmenu.component.html',
    styleUrls: ['./navmenu.component.css']
})
export class NavMenuComponent implements OnInit, AfterViewChecked {

    allcats: Array<string>;
    allNigState: Array<string>;
    loading: boolean = true;

    searchFormGroup: FormGroup;

    currentUserEmailFull: string | null;
    sidebarShowing: boolean;
    valOnSrchbar: boolean;
    hasResult: boolean;
    searchResult: MateItemClient[];
    modalRef: BsModalRef;
    drpdwnDisplaying: boolean;
    currentUserEmail: string | null;
    @ViewChild('UserDrpdwn') parag: ElementRef; 
    @ViewChild('srchbarInput') inputElRef: ElementRef;
    
    constructor(private route: ActivatedRoute, private router: Router, private afa: AngularFireAuth, private modalService: BsModalService, private eleRef: ElementRef, private renderer: Renderer2, private apiservice: ApiService, private fb: FormBuilder) {
        this.allNigState = Utility.ngStates();
        this.allcats = Utility.categories();
    }

    ngAfterViewChecked(): void {
        $(".chevy-down").click((e) => {
            e.preventDefault();
            $("#user-drpdwn").stop().slideDown("fast");
            this.drpdwnDisplaying = true;
            //$('#myModal')
            
        });

        $(".chevy-up").click((e) => {
            e.preventDefault();
            $("#user-drpdwn").stop().slideUp("fast");
            this.drpdwnDisplaying = false;
        });
    }

    hideUserMenu(evt: Event) {
        evt.preventDefault();
        $("#user-drpdwn").stop().slideUp("fast");
        this.drpdwnDisplaying = false;
    }

    openModal(template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template);
      
    }

    //@HostListener('showDrpDwn') showUserMenu(evt: Event) {
    //    this.renderer.setStyle(this.parag.nativeElement, "display", "block");
    //    this.drpdwnDisplaying = true;
    //}

    //@HostListener('hideDrpDwn') hideUserMenu(evt: Event) {
    //    this.renderer.setStyle(this.parag.nativeElement, "display", "none");
    //    this.drpdwnDisplaying = false;
    //}


    ngOnInit(): void {

        this.searchFormGroup = this.fb.group({
            itemCategory: ['', Validators.required],
            itemState: ['', Validators.required]
        });

        this.afa.auth.onAuthStateChanged((user: firebase.User) => {
            if (user) {
                this.currentUserEmail = user.displayName || user.email;
                this.currentUserEmailFull = user.displayName || user.email;

                if (this.currentUserEmail!.length > 6) {
                    this.currentUserEmail = this.currentUserEmail!.substring(0, 6) + "...";
                }

            } else {
                this.currentUserEmail = "";
                this.currentUserEmailFull = "";
            }
        });

        $("#combi-srch-link").click(() => {
            //$(".combinedSearchParent").fadeIn("fast");
            //$("#Qk-srch-wrp").fadeOut("fast");
            $(".combinedSearchParent").css("display","block");
            $("#Qk-srch-wrp").css("display", "none");
        });

        $("#qk-srch-link").click(() => {
            //$(".combinedSearchParent").fadeOut("fast");
            //$("#Qk-srch-wrp").fadeIn("fast");
            $(".combinedSearchParent").css("display", "none");
            $("#Qk-srch-wrp").css("display", "block");
        });
    }

    retrieveMatch(srchbr: HTMLInputElement) {
        this.hasResult = false;
        if (srchbr.value.trim().length > 2) {
            this.apiservice.getMatchedItems(srchbr.value).subscribe((result: MateItemClient[]) => {
                if (result.length > 0) {
                    this.searchResult = result;

                    var thissearchResult = this.searchResult;

                    for (var item in thissearchResult) {
                        thissearchResult[item].title.replace(srchbr.value, "puppy");
                        //thissearchResult[item].title.toLowerCase()
                    }

                    this.hasResult = true;
                    this.valOnSrchbar = true;

                }
                if (result.length == 0) {
                        this.hasResult = false;
                        this.valOnSrchbar = true;
                }

            }, (err: Error) => alert(err.message));
        }
        if (srchbr.value.length == 0) {
            this.valOnSrchbar = false;
        }
    }

    clearSrchBar(evt: Event, srchbr: HTMLInputElement) {
        evt.preventDefault();
        srchbr.value = "";
        this.hasResult = false;
        this.valOnSrchbar = false;
    }

    openSideBar() {
        $("#sidebar-right").animate({
            left: "0",
        }, 300, () => {
            $("#user-menu-sidebar").slideDown('slow');
            $("#overlay").css("display", "block");
            this.sidebarShowing = true;
        })
    }

    closeSideBar() {
       this.HideSidebarAndSlideUserMenuUp();
    }

    openSearchBar() {
        if ($(".srch-bar-wrp").css("display") == "none") {
            $(".srch-bar-wrp").slideDown('slow');
        }
        else {
            $(".srch-bar-wrp").slideUp('slow');
        }
    }

    logOut(evt: Event) {
        evt.preventDefault();
        this.afa.auth.signOut();
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_expiration');
        this.drpdwnDisplaying = false;
        this.router.navigate(['']);
        /*Close the sidebar*/
        this.HideSidebarAndSlideUserMenuUp();
    }

    HideSidebarAndSlideUserMenuUp() {
        $("#sidebar-right").animate({
            left: "-70%",
        }, 300, () => {
            $("#user-menu-sidebar").slideUp('slow');
            $("#overlay").css("display", "none");
            this.sidebarShowing = false;
        });
    }

    searchAndNavigate(value: any) {
        let selectedState = value.itemState;
        let selectedCategory = value.itemCategory;
        //alert(`you submitted  Category: ${selectedCategory} State: ${selectedState} `);
        this.router.navigate(['/state', selectedState, selectedCategory]);
    }
}