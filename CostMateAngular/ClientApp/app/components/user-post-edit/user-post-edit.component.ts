import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Title } from "@angular/platform-browser";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "../../Services/api.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Utility } from "../../Models/Utility";
import { MateItemClient } from "../../Models/MateItemClient";
import * as $ from 'jquery';

@Component({
    selector: 'user-post-edit',
    templateUrl: './user-post-edit.component.html',
    styleUrls: ['./user-post-edit.component.css']
})
export class UserPostEditComponent implements OnInit {
    showRotatingCircle: boolean;
    MAX_FILE_SIZE: any;
    showFileSizeError: boolean;
    pictureDeleted: boolean;
    showFirstImage: boolean;
    showThirdImage: boolean;
    showSecondImage: boolean;
    editItemFormGroup: FormGroup;
    mateItemCl: MateItemClient;
    allNigState: string[];
    allCategory: string[];
    
    constructor(private route: ActivatedRoute, private router: Router, private pageTitle: Title, private httpclient: HttpClient, private apiservice: ApiService, private fb: FormBuilder, private _location:Location) {
        this.allNigState = Utility.ngStates();
        this.allCategory = Utility.categories();
        this.MAX_FILE_SIZE = 10*1024*1024;
    }
    
   ngOnInit(): void {
       //postEditDataResv
       this.pageTitle.setTitle("Edit Item");

       this.route.data.subscribe((data: any) => {
           this.mateItemCl = data['postEditDataResv'];
           //alert(JSON.stringify(this.mateItemCl));
       });

       this.editItemFormGroup = this.fb.group({
           title: [this.mateItemCl.title, [Validators.required, Validators.minLength(5), Validators.maxLength(60)]],
           description: [this.mateItemCl.description, [Validators.required, , Validators.minLength(10), Validators.maxLength(400)]],
           itemCategory: [this.mateItemCl.itemCategory, Validators.required],
           itemState: [this.mateItemCl.itemState, Validators.required],
           firstImage: [''],
           secondImage: [''],
           thirdImage: ['']
       }); 
    }

   updateItem(itemId: number, formValue: any, editItemFormGrp: FormGroup) {
       var firstImgInputFile = (<HTMLInputElement>$("#firstImgInput")[0]).files![0];
       var secondImgInputFile = (<HTMLInputElement>$("#secondImgInput")[0]).files![0];
       var thirdImgInputFile = (<HTMLInputElement>$("#thirdImgInput")[0]).files![0];

       this.showRotatingCircle = true;

       this.apiservice.updateMateItem(itemId, formValue, editItemFormGrp, firstImgInputFile, secondImgInputFile, thirdImgInputFile)!.subscribe(res => {
           //Show rotating circle
           
           this.router.navigate([`/dashboard/post/${itemId}`]);
           this.showRotatingCircle = false;
           //Hide rotating circle
       });
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
       //alert(im.files![0].name);
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
       //alert(im.files![0].name);
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

   thirdImgInputChanged(im: HTMLInputElement) {
       //alert(im.files![0].name);
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
    /*****************First Image Logic*****************/
   clearFirstImgPrev() {
       $("#firstImgInput").val('');
       this.showFirstImage = false;
   }
   clearFirstImgFromDb(imgId: number) {
       this.apiservice.deleteSpecificImage(imgId).subscribe((res:any) => {
           //alert(JSON.stringify(res.delmsg));
           this.pictureDeleted = true;
           var thismateItemClPhotos = this.mateItemCl.itemPhotos;
           for (var i = 0; i < thismateItemClPhotos.length; i++) {
               if (thismateItemClPhotos[i].id == imgId) {
                   thismateItemClPhotos.splice(thismateItemClPhotos.indexOf(thismateItemClPhotos[i]), 1);
               }
           }

           setTimeout(() => { this.pictureDeleted = false;}, 1500);
       });
   }
/*****************End of First Image Logic*****************/

/*****************Second Image Logic*****************/
   clearSecondImgPrev() {
       $("#secondImgInput").val('');
       this.showSecondImage = false;
   }
   clearSecondImgFromDb(imgId: number) {
       //alert(`Ready to delete second img no: ${imgId} from db`);
       this.apiservice.deleteSpecificImage(imgId).subscribe((res: any) => {
           //alert(JSON.stringify(res.delmsg));
           this.pictureDeleted = true;
           var thismateItemClPhotos = this.mateItemCl.itemPhotos;
           for (var i = 0; i < thismateItemClPhotos.length; i++) {
               if (thismateItemClPhotos[i].id == imgId) {
                   thismateItemClPhotos.splice(thismateItemClPhotos.indexOf(thismateItemClPhotos[i]), 1);
               }
           }
           setTimeout(() => { this.pictureDeleted = false; }, 1500);
       });
   }
/*****************End of Second Image Logic*****************/

/*****************Third Image Logic*****************/
   clearThirdImgPrev() {
       $("#thirdImgInput").val('');
       this.showThirdImage = false;
   }

   clearThirdImgFromDb(imgId:number) {
       this.apiservice.deleteSpecificImage(imgId).subscribe((res: any) => {
           this.pictureDeleted = true;
           var thismateItemClPhotos = this.mateItemCl.itemPhotos;
           for (var i = 0; i < thismateItemClPhotos.length; i++) {
               if (thismateItemClPhotos[i].id == imgId) {
                   thismateItemClPhotos.splice(thismateItemClPhotos.indexOf(thismateItemClPhotos[i]), 1);
               }
           }
           setTimeout(() => { this.pictureDeleted = false; }, 1500);
       });
   }

   //Reset showFileSizeError when alert is closed.
   alertClosed() {
       this.showFileSizeError = false;
   }

   goBackToDetail(evt: Event) {
       evt.preventDefault();
       //this._location.back();
       this.router.navigate(['/dashboard', 'post', this.route.snapshot.params['id']]);
   }

    goBackToList(evt: Event) {
       evt.preventDefault();
       //this._location.back();
       this.router.navigate(['/dashboard', 'post']);
   }
}