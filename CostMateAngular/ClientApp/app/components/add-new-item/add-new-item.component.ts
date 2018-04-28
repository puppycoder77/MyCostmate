import { Component, OnInit, AfterViewChecked, HostListener, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser'
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { Utility } from "../../Models/Utility";
import { ApiService } from "../../Services/api.service";
import * as $ from 'jquery';
import * as firebase from 'firebase/app';
import { Router } from "@angular/router";
import { AngularFireAuth } from "angularfire2/auth";
import { HttpClient } from "@angular/common/http";
import { MateItemClient } from "../../Models/MateItemClient";
import { HttpErrorResponse, HttpHeaders } from "@angular/common/http";


@Component({
    selector: 'add-new-item',
    templateUrl: './add-new-item.component.html',
    styleUrls: ['./add-new-item.component.css']
})

export class AddNewItemComponent implements OnInit/*, AfterViewChecked*/ {
    userLoggedIn: boolean;
    caughtEmptyValue: boolean;
    ErrorReason: any;
    publishingStarted: boolean;
    showFileSizeError: boolean;
    allNigState: string[];
    allCategory: string[];
    addNewItemFormGroup: FormGroup;
    showFirstImage: boolean;
    showSecondImage: boolean;
    showThirdImage: boolean;
    mateItem: MateItemClient;
    private MAX_FILE_SIZE: number;

    constructor(private pageTitle: Title, private fb: FormBuilder, private apiservice: ApiService, @Inject('BASE_URL') private baseUrl: string, private httpclient: HttpClient, private router: Router, private afa: AngularFireAuth) {

        this.allNigState = Utility.ngStates();
        this.allCategory = Utility.categories();
        this.MAX_FILE_SIZE = 10 * 1024 * 1024;
    }

    ngOnInit(): void {

        if (this.afa.auth.currentUser) {
            this.userLoggedIn = true;
        }
        else {
            this.userLoggedIn = false;
        }

        this.pageTitle.setTitle('Add new item');
        this.addNewItemFormGroup = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]],
            description: ['', [Validators.required, , Validators.minLength(10), Validators.maxLength(400)]],
            itemCategory: ['', Validators.required],
            itemState: ['', Validators.required],
            firstImage: [''],
            secondImage: [''],
            thirdImage: ['']
        });
    }

    addAndNavigate(value: any) {
        let titleVal = value.title;
        let itemStateVal = value.itemState;
        let itemCategoryVal = value.itemCategory;
        let descriptionVal = value.description;
        let firstImageVal: File = (<HTMLInputElement>$("#firstImgInput")[0]).files![0];
        let secondImageVal: File = (<HTMLInputElement>$("#secondImgInput")[0]).files![0];
        let thirdImageVal: File = (<HTMLInputElement>$("#thirdImgInput")[0]).files![0];

        ///////TRIMMED VALUES////////////
        let titleValTrimmedLength = (<string>titleVal).trim().length;
        let descriptionValTrimmedLength = (<string>descriptionVal).trim().length;

        if (titleValTrimmedLength < 1 || descriptionValTrimmedLength < 1) {
            //alert(`you are trying to submit an empty Value`);
            this.caughtEmptyValue = true;
            this.addNewItemFormGroup.get('title')!.reset();
            this.addNewItemFormGroup.get('description')!.reset();
        }
        else {
            //Create and Populate form data.
            var formData = new FormData();
            formData.append('Title', titleVal);
            formData.append('Description', descriptionVal);
            formData.append('ItemState', itemStateVal);
            formData.append('ItemCategory', itemCategoryVal);
            formData.append('FirstImage', firstImageVal);
            formData.append('SecondImage', secondImageVal);
            formData.append('ThirdImage', thirdImageVal);

            //this.apiservice.postNewItem(formData);
            this.afa.auth.currentUser!.getToken(true).then((token) => {
                localStorage.setItem('auth_token', token);
            }, (err: firebase.FirebaseError) => {

                var errdetail: any = null;
                //if (err.code == "auth/user-not-found") {
                //    errdetail = "No user with such identity"
                //}
                if (err.message == "A network error (such as timeout, interrupted connection or unreachable host) has occurred.") {
                    errdetail = "Can't connect to server, check your internet connection and press the submit button again."
                }
                else {
                    errdetail = err.message;
                }
                this.ErrorReason = errdetail;
            });           

            let header = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') });
            var req = this.httpclient.post(this.baseUrl + 'api/MateItem', formData, { headers: header });

            this.publishingStarted = true;
            req.subscribe((result: any) => {
                this.mateItem = result;
                this.router.navigate(['/state', this.mateItem.itemState, this.mateItem.itemCategory, this.mateItem.id]);
                this.publishingStarted = false;
                this.addNewItemFormGroup.get('title')!.reset();
                this.addNewItemFormGroup.get('description')!.reset();

            }, (error: HttpErrorResponse) => {
                //alert(`Tulekwa error anuwa: ${error.url}`)
                if (error.error instanceof Error) {
                    // A client-side or network error occurred. Handle it accordingly.
                    console.log('An error occurred na client:', error.error.message);
                } else {
                    // The backend returned an unsuccessful response code.
                    // The response body may contain clues as to what went wrong,
                    console.log(`Backend returned code ${error.message}, body was: ${error.error}`);
                }
            });

            //this.addNewItemFormGroup.get('title')!.reset();
            //this.addNewItemFormGroup.get('description')!.reset();
        }
    }

    ngAfterViewChecked(): void {
    }

    /////CLICKING IMAGE TRIGGERS HIDDEN FILE INPUT CLICK/////////
    firstImgInputClickTrigger() {
        $("#firstImgInput").trigger("click");
    }

    secondImgInputClickTrigger() {
        $("#secondImgInput").trigger("click");
    }

    thirdImgInputClickTrigger() {
        $("#thirdImgInput").trigger("click");
    }
     /////END OF CLICKING IMAGE TRIGGERS HIDDEN FILE INPUT CLICK/////////

    ///////IMAGE HAS BEEN SELECTED//////
    firstImgInputChanged(im: HTMLInputElement) {
        var firstSelectedFile = im.files![0];
        var reader = new FileReader();
        if (firstSelectedFile.size > 0 && firstSelectedFile.size <= this.MAX_FILE_SIZE) {
            reader.readAsDataURL(firstSelectedFile);
            reader.onload = function (file) {
                let fileNowFr = <FileReader>file.target;
                $("#firstImgDisplay").attr("src", fileNowFr.result);
            }
            this.showFirstImage = true;
        }
        else {
            this.showFileSizeError = true;
            $("#firstImgInput").val('');
        }
    }

    secondImgInputChanged(im: HTMLInputElement) {
        var firstSelectedFile = im.files![0];
        var reader = new FileReader();
        if (firstSelectedFile.size > 0 && firstSelectedFile.size <= this.MAX_FILE_SIZE) {
            reader.readAsDataURL(firstSelectedFile);
            reader.onload = function (file) {
                let fileNowFr = <FileReader>file.target;
                $("#secondImgDisplay").attr("src", fileNowFr.result);
            }
            this.showSecondImage = true;
        }
        else {
            this.showFileSizeError = true;
            $("#secondImgInput").val('');
        }
    }

    thirdImgInputChanged(im: HTMLInputElement, evt: Event) {
        var firstSelectedFile = im.files![0];
        var reader = new FileReader();
        if (firstSelectedFile.size > 0 && firstSelectedFile.size <= this.MAX_FILE_SIZE) {
            reader.readAsDataURL(firstSelectedFile);
            reader.onload = function (file) {
                let fileNowFr = <FileReader>file.target;
                $("#thirdImgDisplay").attr("src", fileNowFr.result);
            }
            this.showThirdImage = true;
        }
        else {
            this.showFileSizeError = true;
            $("#thirdImgInput").val('');
        }
    }
    ///////END OF IMAGE HAS BEEN SELECTED//////

    ////////CLEAR FILE INPUT VAL///////
    clearFirstImgPrev() {
        $("#firstImgInput").val('');
        this.showFirstImage = false;
    }

    clearSecondImgPrev() {
        $("#secondImgInput").val('');
        this.showSecondImage = false;
    }

    clearThirdImgPrev() {
        $("#thirdImgInput").val('');
        this.showThirdImage = false;
    }
    //Reset showFileSizeError when alert is closed.
    alertClosed() {
        this.showFileSizeError = false;
    }

    alertForEmptyValClosed() {
        this.caughtEmptyValue = false;
    }
}