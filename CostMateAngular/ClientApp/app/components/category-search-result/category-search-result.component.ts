import { Component } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";

@Component({
    selector: 'category-search-result',
    templateUrl: './category-search-result.component.html',
    styleUrls: ['./category-search-result.component.css']
})
/** CategorySearchResult component*/
export class CategorySearchResultComponent {
    /** CategorySearchResult ctor */
    constructor(private pageTitle: Title, private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.pageTitle.setTitle("Category Search result");
    }
}