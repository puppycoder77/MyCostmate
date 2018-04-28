import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from "@angular/platform-browser";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { ApiService } from "../../Services/api.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MateItemClient } from "../../Models/MateItemClient";
import { mateItemWithRelatedObjectsClient } from "../../Models/mateItemWithRelatedObjectsClient";
import { AngularFireAuth } from "angularfire2/auth";
import { PhotoClient } from "../../Models/PhotoClient";
import { CarouselConfig } from "ngx-bootstrap";
import * as firebase from 'firebase/app';

@Component({
    selector: 'item-detail',
    templateUrl: './item-detail.component.html',
    styleUrls: ['./item-detail.component.css'],
    providers: [
        { provide: CarouselConfig, useValue: { interval: 6000, noPause: false } }
    ]
})
export class ItemDetailComponent implements OnInit {
    postNotYetApproved: boolean;
    isCurrentUserAnAdmin: boolean;
    itemDate: Date;
    itemOwnerPhotoUrl: string;
    tryingToSendEmpty: boolean;
    msgSentMsgShow: boolean;
    allImage: PhotoClient[];
    mainItemId: number;
    postIsFromCurrentUser: boolean;
    showmessageArea: boolean;
    itemOwnerPhone: string;
    ownerRegisteredDate: Date;
    thirdImage: string;
    secondImage: string;
    firstImage: any;
    ownerLastname: string;
    ownerFirstname: string;
    currentItemId: number;
    itemDescription: string;
    itemTitle: string;
    itemOwnerFullname: string;
    mateItemWithRelObjs: mateItemWithRelatedObjectsClient;
    sndMsgFormGroup: FormGroup;

    currentCategory: string;
    currentState: string;
    currentCategoryFirstUpper: string;
    currentStateFirstUpper: string;

    constructor( @Inject('BASE_URL') private baseUrl: string, private httpclient: HttpClient, private router: Router, private route: ActivatedRoute, private pageTitle: Title, private fb: FormBuilder, private apiservice: ApiService, private afa: AngularFireAuth) { }

    ngOnInit(): void {
        this.pageTitle.setTitle("Item detail");

        this.postNotYetApproved = false;

        this.sndMsgFormGroup = this.fb.group({
            //senderName: ['', Validators.required],
            //senderEmail: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')]],
            message: ['', Validators.required]
        });

        this.route.params.subscribe(params => {
            this.currentItemId = +params["id"];
            this.currentState = params["statename"];
            this.currentCategory = params["catname"];
            this.currentStateFirstUpper = this.currentState.replace(this.currentState.substring(0, 1), this.currentState.substring(0, 1).toUpperCase());
            this.currentCategoryFirstUpper = this.currentCategory.replace(this.currentCategory.substring(0, 1), this.currentCategory.substring(0, 1).toUpperCase());
        });

        this.route.data.subscribe((data: any) => {
            this.mateItemWithRelObjs = data['itemDetailDataResv'];
            if (this.mateItemWithRelObjs != null) {
                this.mainItemId = this.mateItemWithRelObjs.mainMateItem.id;
                this.itemTitle = this.mateItemWithRelObjs.mainMateItem.title;
                this.itemDescription = this.mateItemWithRelObjs.mainMateItem.description;
                this.itemOwnerFullname = this.mateItemWithRelObjs.mainMateItem.owner.fullname;
                this.itemDate = this.mateItemWithRelObjs.mainMateItem.datePosted;

                //Check whether the current user is the owner of this post.
            if (this.mateItemWithRelObjs.currentUserDetails) {
                if (this.mateItemWithRelObjs.currentUserDetails!.isUserAuth) {
                    var currUserDetailsuniqueId = this.mateItemWithRelObjs.currentUserDetails!.uniqueId;
                    if (currUserDetailsuniqueId == this.mateItemWithRelObjs.mainMateItem.owner.uniqueId) {
                        this.postIsFromCurrentUser = true;
                    }
                    else {
                        this.postIsFromCurrentUser = false;
                    }

                    this.showmessageArea = true;
                }
                else {
                    this.showmessageArea = false;
                }
            }

            //Check whether the current user is an administrator, logic working, Puppy Stark!!!
            if (this.mateItemWithRelObjs.currentUserDetails) {
                if (this.mateItemWithRelObjs.currentUserDetails.isUserAdmin) {
                    //alert("Okwanu Adminooooo!!!!");
                    this.isCurrentUserAnAdmin = true;
                }
            }
                //Check if this current post is approved.
            if (!this.mateItemWithRelObjs.mainMateItem.approved) {
                this.postNotYetApproved = true;
            }
            else {
                this.postNotYetApproved = false;
            }


            this.itemOwnerPhone = this.mateItemWithRelObjs.mainMateItem.owner.phone;
            this.itemOwnerPhotoUrl = this.mateItemWithRelObjs.mainMateItem.owner.photoUrl;
            this.ownerRegisteredDate = this.mateItemWithRelObjs.mainMateItem.owner.dateRegistered;
            if (this.mateItemWithRelObjs.mainMateItem.itemPhotos[0]) {
                this.firstImage = this.mateItemWithRelObjs.mainMateItem.itemPhotos[0]!.filename;
                this.allImage = this.mateItemWithRelObjs.mainMateItem.itemPhotos;
            }
            else {
                this.firstImage = null;
            }

            if (this.mateItemWithRelObjs.mainMateItem.itemPhotos[1]) {
                this.secondImage = this.mateItemWithRelObjs.mainMateItem.itemPhotos[1].filename;
            }
            if (this.mateItemWithRelObjs.mainMateItem.itemPhotos[2]) {
                this.thirdImage = this.mateItemWithRelObjs.mainMateItem.itemPhotos[2].filename;
            }

            var othersByOwner = this.mateItemWithRelObjs.otherMateItemsByOwner;
            var othersWithSameCatAndState = this.mateItemWithRelObjs.otherMateItemsWithSameCatAndState;

            reduceDesclength(othersByOwner);
            reduceDesclength(othersWithSameCatAndState);
            }
            function reduceDesclength(mi: MateItemClient[]) {
                for (var item in mi) {
                    if (mi[item].description.length > 120) {
                        mi[item].description = mi[item].description.substring(0, 120) + "...";
                    }
                }
            }
        }, (err: Error) => {
            alert(err.message);
            //this.emailOrPswdInvalid = errdetail;
            //alert(errdetail);
        });
    }

    sndMsgAndNotify(value: any) {
        let messageVal = value.message;
        let messageValTrimmedLength = (<string>messageVal).trim().length;

        if (/*senderNameValTrimmedLength < 1 || senderEmailValTrimmedLength < 1 || */messageValTrimmedLength < 1) {
            //alert(`You are trying to submit an empty Value`);
            this.tryingToSendEmpty = true;
            this.sndMsgFormGroup.reset();
        }
        else {
            var userMessage = {
                "body": value.message
            }
            this.apiservice.sendMessage(this.mateItemWithRelObjs.mainMateItem.id, this.mateItemWithRelObjs.mainMateItem.owner.id, userMessage,"new").subscribe(res => {
                alert(res.toString());
            })
            this.msgSentMsgShow = true;
            this.sndMsgFormGroup.reset();
        }
    }

    loginAndBacktoOrigin(evt: Event) {
        evt.preventDefault();
        //grab origin and get back//IMPLEMENT LATER
        this.apiservice.prevUrl = `/state/${this.route.snapshot.params['statename']}/${this.route.snapshot.params['catname']}/${this.route.snapshot.params['id']}`;

        this.router.navigate(['/signin']);
    }

    alertClosed() {
        this.msgSentMsgShow = false;
        this.tryingToSendEmpty = false;
    }


    ApprovePost() {
        this.afa.auth.currentUser!.getToken(true).then((token) => { localStorage.setItem('auth_token', token); });
        let header = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') });

        //Watch this null that i passed to the body option.this null is very important when there is no body value to supply, else call will fail(Puppy).
        this.httpclient.post(this.baseUrl + `api/MateItem/approvePost/1/${this.currentItemId}`,null, { headers: header }).subscribe((res:any) => {
            alert(res.msg);
        });

        this.postNotYetApproved = false;
    }

    DisapprovePost() {
        this.afa.auth.currentUser!.getToken(true).then((token) => { localStorage.setItem('auth_token', token); });
        let header = new HttpHeaders({ 'Authorization': 'Bearer ' + localStorage.getItem('auth_token') });

        //Watch this null that i passed to the body option.this null is very important when there is no body value to supply, else call will fail(Puppy).
        this.httpclient.post(this.baseUrl + `api/MateItem/approvePost/0/${this.currentItemId}`, null, { headers: header }).subscribe((res: any) => {
            alert(res.msg);
        });

        this.postNotYetApproved = true;
    }

    

    AdminDeletePost() {
        alert("I think deleting from here will come handy, after sending user message and he did not correct mistakes");
    }
}