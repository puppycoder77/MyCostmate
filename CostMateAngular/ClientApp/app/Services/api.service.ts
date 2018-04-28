import { Injectable, Inject } from '@angular/core';
import { AngularFireAuth } from "angularfire2/auth";
import { HttpClient } from "@angular/common/http";
import { HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { MateItemClient } from "../Models/MateItemClient";
import { Router } from "@angular/router";
import { AppUserClient } from "../Models/AppUserClient";
import { Observable } from "rxjs/Observable";
import { FormGroup } from "@angular/forms";
import * as $ from 'jquery';


@Injectable()
export class ApiService {
    prevUrl: any;
    deletedItemId: number; //TODO:This is for deleted message id change name to deletedMsgItemId
    deletedPostItemId: number;
    msgFrmDelPost: string | any;
    currentSenderId: number | any;
    currentItemId: number | any;
    currentItemExtractedTitle: string | any;

    constructor( @Inject('BASE_URL') private baseUrl: string, private httpclient: HttpClient, private router: Router, private afa: AngularFireAuth) { }

    postNewItem(formData: any) {
        //this.afa.auth.currentUser!.getToken(true).then((token) => {
        //    localStorage.setItem('auth_token', token);
        //});

        //let header = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') });
        //    this.httpclient.post(this.baseUrl + 'api/MateItem', formData, { headers: header }).subscribe((result: any) => {
        //        this.mateItem = result;
        //        alert(
        //            `This is the value of just posted item:\n
        //            Id: ${this.mateItem.id}\n
        //            Title: ${this.mateItem.title}\n
        //            Description: ${this.mateItem.description}\n
        //            Owner: ${this.mateItem.owner.fullname}\n
        //            Owner Phone Number: ${this.mateItem.owner.phone}\n
        //            `);

        //        alert(this.mateItem.id);

        //        this.router.navigate(['/state', this.mateItem.itemState, this.mateItem.itemCategory, this.mateItem.id]);

        //    }, (error: HttpErrorResponse) => alert(`Tulekwa error anuwa: ${error.statusText}`));

    }

    getMatchedItems(searchbarVal: any): Observable<MateItemClient[]> {
        return this.httpclient.get<MateItemClient[]>(this.baseUrl + `api/MateItem/searchbar/${searchbarVal}`);
    }

    sendMessage(mateItemId: number, receiverId: number, msg: any, msgType:any) {
        this.afa.auth.currentUser!.getToken(true).then((token) => { localStorage.setItem('auth_token', token); });
        let header = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('auth_token'), 'Content-Type': 'application/json' });
        return this.httpclient.post(this.baseUrl + `api/AppUserManager/user/sendMsg/${mateItemId}/${receiverId}/${msgType}`, JSON.stringify(msg), { headers: header });
    }

    deleteMessage(msgId: number) {
        //user/deleteSpecificMsg/{ msgId }
        this.afa.auth.currentUser!.getToken(true).then((token) => { localStorage.setItem('auth_token', token); });
        let header = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') });
        return this.httpclient.delete(this.baseUrl + `api/AppUserManager/user/deleteSpecificMsg/${msgId}`, { headers: header });
    }

    updateMateItem(itemId: number, formValue: any, editItemFormGroup: FormGroup | any, firstfile: any, secondfile: any, thirdfile: any) {
        this.afa.auth.currentUser!.getToken(true).then((token) => { localStorage.setItem('auth_token', token); });
        let header = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') });

        let titleVal = formValue.title;
        let itemStateVal = formValue.itemState;
        let itemCategoryVal = formValue.itemCategory;
        let descriptionVal = formValue.description;
        let firstImageVal: File = firstfile;
        let secondImageVal: File = secondfile;
        let thirdImageVal: File = thirdfile;
         //let firstImageVal: File = (<HTMLInputElement>$("#firstImgInput")[0]).files![0];
         //let secondImageVal: File = (<HTMLInputElement>$("#secondImgInput")[0]).files![0];
        //let thirdImageVal: File = (<HTMLInputElement>$("#thirdImgInput")[0]).files![0];

        ///////TRIMMED VALUES////////////
        let titleValTrimmedLength = (<string>titleVal).trim().length;
        let descriptionValTrimmedLength = (<string>descriptionVal).trim().length;

        if (titleValTrimmedLength < 1 || descriptionValTrimmedLength < 1) {
            alert(`you are trying to submit an empty Value`);
            editItemFormGroup.get('title')!.reset();
            editItemFormGroup.get('description')!.reset();
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

            return this.httpclient.put(this.baseUrl + `api/AppUserManager/user/editSpecificUserPosts/${itemId}`, formData, { headers: header });
        }
    }

    updateUserPic(firstfile: any) {
        this.afa.auth.currentUser!.getToken(true).then((token) => { localStorage.setItem('auth_token', token); });
        let header = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') });

        var formData = new FormData();
        formData.append('userImageVal', firstfile);
        
        //let userImageVal: File = firstfile;
        return this.httpclient.post(this.baseUrl + `api/AppUserManager/userProfile/editUserPic`, formData, { headers: header });
    }

    deleteSpecificImage(imgId: number) {
        this.afa.auth.currentUser!.getToken(true).then((token) => { localStorage.setItem('auth_token', token); });
        let header = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') });
        return this.httpclient.delete(this.baseUrl + `api/AppUserManager/user/deleteSpecificImgFromPost/${imgId}`, { headers: header });
    }

    deleteMateItem(itemId: number) {
        this.afa.auth.currentUser!.getToken(true).then((token) => { localStorage.setItem('auth_token', token); });
        let header = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') });
        return this.httpclient.delete(this.baseUrl + `api/AppUserManager/user/deleteSpecificUserPost/${itemId}`, { headers: header });
    }
}