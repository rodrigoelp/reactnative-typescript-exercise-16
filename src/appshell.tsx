/**
 * @author Rod Landaeta
 * @description This component definition, and all the logic written here should not be used as production ready code.
 * Is meant to be an example and all the code (or most of it) is written down here with the sole purpose to make it easier
 * to a reader trying to get their head around all the moving components. You need to refactor this code to pull styles, services, etc
 * making it more maintainable.
 * 
 * You have been warned.
 */
import * as React from "react";
import { Text, View, FlatList, RefreshControl, Image } from "react-native";
import PouchDB from "pouchdb-react-native";
import { BookSummary, Book } from "./models";
import { BookDataModel } from "./dataModels";
import { getDeviceInfo } from "./deviceInfo";

const baseUrl = "https://raw.githubusercontent.com/rodrigoelp/reactnative-typescript-exercise-15/master/onlineCatalog/";
const db = new PouchDB<BookDataModel>("cachedBooks"); // this line does the same thing as initialising the database on the previous exercise.
const deviceInfo = getDeviceInfo();

/** 
 * Definition of the state used by the AppShell component.
 */
interface AppState {
    books: BookSummary[];
    refreshing: boolean;
}

/** 
 * Component containing all the behaviour and logic for this application.
*/
class AppShell extends React.Component<{}, AppState> {

    constructor(props: any) {
        super(props);

        // When the application is lauched, the known state should be empty whilst downloads the remote content for us to use.
        this.state = { books: [], refreshing: false };
    }

    componentDidMount() {
        // Again, I hope this is self explanatory.
        // Basically, we are chaining the promises as read below to check if we need to download
        // data and store it in the database or to determine if we call pull it from the local version.
        this.checkIfBooksHaveBeenDownlaoded()
            .then(this.downloadContentIfRequired)
            .then(this.displayContents)
            .catch(e => console.warn(`There has been a problem I did not anticipated and needs to be checked. Code: ${e}`));
    }

    public render() {
        return (
            <View style={{ flex: 1, backgroundColor: "#eeeeff" }}>
                <View style={{ height: deviceInfo.statusBarHeight }} />
                <FlatList
                    data={this.state.books}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    renderItem={({ item }) => this.renderBook(item)}
                    refreshControl={<RefreshControl onRefresh={this.handleRefresh} refreshing={this.state.refreshing} />}
                    ItemSeparatorComponent={this.renderSeparator}
                />
            </View>
        )
    }
    renderSeparator = () => {
        return (
            <View style={{ height: 1, backgroundColor: "gray", marginHorizontal: 40 }} />
        );
    }

    renderBook = (book: BookSummary) => {
        return (
            <View style={{ flex: 1, padding: 20, flexDirection: "row" }}>
                <Image source={{ uri: book.thumbnail, height: 80, width: 80 }} />
                <View style={{ flex: 1, alignContent: "center" }}>
                    <Text style={{ flex: 1, textAlign: "center", textAlignVertical: "center" }}>{book.name}</Text>
                    <Text style={{ flex: 1, textAlign: "center" }}>By: {book.author}</Text>
                    <Text style={{ flex: 1, textAlign: "right" }}>Rating: {book.rate} / 5</Text>
                </View>
            </View>
        );
    }

    checkIfBooksHaveBeenDownlaoded = (): Promise<boolean> => {
        // let's check if there's any document stored locally.
        return db.allDocs().then(res => res.total_rows > 0);
    }

    downloadContentIfRequired = (isPopulated: boolean): Promise<boolean> => {
        // If there is nothing locally, let's pull it down from the internet and save it locally.
        if (!isPopulated) {
            return fetch(`${baseUrl}index.json`)
                .then(r => r.json())
                .then((r: Book[]) => this.persistData(r));
        }
        // If there is something locally, we don't need to pull it down again. Let's just say we can continue.
        return Promise.resolve(true);
    }

    persistData = (data: Book[]): Promise<boolean> => {
        const dataModels = data.map<BookDataModel>((a, index) => ({
            _id: `${index}`,
            bookId: index,
            name: a.name,
            author: a.attributes.overview_author,
            rating: a.rate,
            tags: a.tags,
            bannerUrl: a.attributes.images_banner,
            thumbnailUrl: a.attributes.images_thumbnail
        }));

        // I could've use a bulk insertion instead of one by one...
        // but let's play with this idea first.
        return Promise.all(dataModels.map(a => db.put(a)))
            .then(responses => responses.reduce((acc, v) => v.ok && acc, true));
// when checking the responses, this is going to give us a silent error as we are ignoring any message coming from the responses.
// for the time being, I will be ignoring this.
    }

    displayContents = (isStoredOk: boolean) => {
        if (isStoredOk) {
            db.allDocs()
                .then(content => {
                    return content.rows
                        .map<BookDataModel>(v => v.doc as BookDataModel)
                        .map<BookSummary>(v => ({
                            id: v.bookId,
                            author: v.author,
                            banner: `${baseUrl}${v.bannerUrl}`, // decided to save the smaller version of the url instead of the whole thing. Not really important.
                            name: v.name,
                            rate: v.rating,
                            tags: v.tags,
                            thumbnail: `${baseUrl}${v.thumbnailUrl}`
                        }));
                })
                .then(books => this.setState({ ...this.state, books }));
        }
        else {
            console.warn("An unexpected behaviour just happened. Attach your debugger and let's find what is wrong!");
        }
    }

    handleRefresh = () => {
        // On refresh, we will destroy the database, redownload the content and reinserted.
        this.setState({ ...this.state, refreshing: true });
        db.destroy()
            .then(_ => true)
            .then(this.downloadContentIfRequired)
            .then(this.displayContents)
            .then(_ => this.setState({ ...this.state, refreshing: false }))
            .catch(e => console.warn(`I really need to include something to handle my errors ${e}`));
    }
}

export { AppShell };