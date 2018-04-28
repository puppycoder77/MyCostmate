import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { AngularFireAuth } from "angularfire2/auth";
import * as firebase from 'firebase/app';
import { Observable } from "rxjs/Observable";
import { ApiService } from "../../Services/api.service";
import { HttpHeaders } from "@angular/common/http";
import { HttpClient } from "@angular/common/http";
import { AppUserClient } from "../../Models/AppUserClient";
import { ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";
import * as $ from 'jquery';



@Component({
    selector: 'user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
    @ViewChild('userImage')userImage: ElementRef;
    showFileSizeError: boolean;
    showRealImage: boolean;
    MAX_FILE_SIZE: any;
    appUsercl: AppUserClient;
    currentUserEmail: string | null;
    currentUserPhotoUrl: string | null;
   
    constructor( @Inject('BASE_URL') private baseUrl: string, private httpclient: HttpClient, private afa: AngularFireAuth, private apiservice: ApiService, private route: ActivatedRoute, private pageTitle: Title) {
        this.MAX_FILE_SIZE = 10 * 1024 * 1024;
    }

    ngOnInit(): void {
        this.pageTitle.setTitle("User Profile");
        this.route.data.subscribe(data => this.appUsercl = data['userdataResv']);
        this.currentUserPhotoUrl = this.appUsercl.photoUrl;
        this.currentUserEmail = this.appUsercl.email;

        //this.afa.auth.onAuthStateChanged((user: firebase.User) => {
        //    if (user) {
        //        this.currentUserPhotoUrl = user.photoURL;
        //        this.currentUserEmail = user.email;
        //    }

        //    else {
        //        this.currentUserPhotoUrl = "";
        //        this.currentUserEmail = "";
        //    }
        //})
    }

    changePhoto() {
        $("#userImage").trigger("click");
    }

    userImgInputChanged(im: HTMLInputElement) {
        var firstSelectedFile = im.files![0];
        var reader = new FileReader();
        if (firstSelectedFile.size > 0 && firstSelectedFile.size <= this.MAX_FILE_SIZE) {
            reader.readAsDataURL(firstSelectedFile);
            reader.onload = function (file) {
                let fileNowFr = <FileReader>file.target;
                $("#firstImgDisplay").attr("src", fileNowFr.result);
            }
            this.showRealImage = true;
        }
        else {
            this.showFileSizeError = true;
            //$("#firstImgDisplay").val('');
        }
    }

    clearUserImgPrev() {
        $("#firstImgDisplay").val('');
        this.showRealImage = false;
    }

    alertClosed() {
        this.showFileSizeError = false;
        //$("#firstImgDisplay").val('');
    }

    uploadUserImg() {
       //alert("Upload function coming soon");
        var nativeElement: HTMLInputElement = this.userImage.nativeElement;

        this.apiservice.updateUserPic(nativeElement.files![0]).subscribe((msg:any) => {
            alert(msg.infoMsg);
            this.showRealImage = false;
        });
    }
}