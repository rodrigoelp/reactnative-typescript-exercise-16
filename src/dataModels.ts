/**
 * Representation of my model stored in pouchdb.
 */
export interface BookDataModel {
    bookId: number;
    name: string;
    author: string;
    rating: number;
    tags: string;
    bannerUrl: string;
    thumbnailUrl: string;
}