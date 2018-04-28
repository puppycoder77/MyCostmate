import { AppUserClient } from "./AppUserClient";
import { PhotoClient } from "./PhotoClient";

export class MateItemClient {
    id: number;
    title: string;
    description: string;
    owner: AppUserClient;
    itemState: string;
    itemCategory: string;
    approved: boolean;
    showOnHomePage: boolean; 
    itemPhotos: Array<PhotoClient>;
    datePosted: Date;
    viewCount: number;
}