import * as React from "react";
import { Text, View, FlatList, RefreshControl, Image } from "react-native";
import PouchDB from "pouchdb-react-native";
import { BookSummary, Book } from "./models";
import { BookDataModel } from "./dataModels";
import { getDeviceInfo } from "./deviceInfo";

interface AppState {
    books: BookSummary[];
    refreshing: boolean;
}

const baseUrl = "https://raw.githubusercontent.com/rodrigoelp/reactnative-typescript-exercise-15/master/onlineCatalog/";
const db = new PouchDB<BookDataModel>("cachedBooks"); // this line does the same thing as initialising the database on the previous exercise.
const deviceInfo = getDeviceInfo();

class AppShell extends React.Component<{}, AppState> {

    constructor(props: any) {
        super(props);

        this.state = { books: [], refreshing: false };
    }

    componentDidMount() {
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
        return db.allDocs()
            .then(res => res.total_rows > 0);
    }

    downloadContentIfRequired = (isPopulated: boolean): Promise<Book[]> => {
        if (!isPopulated) {
            return fetch(`${baseUrl}index.json`)
                .then(r => r.json())
                .then(r => this.persistData(r));
        }
        return Promise.resolve(new Array<Book>());
    }

    persistData = (data: Book[]): Promise<Book[]> => {
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

        return Promise.all(dataModels.map(a => db.put(a)))
            .then(responses => {
                const wasOk = responses.reduce((acc, v) => v.ok && acc, true);
                if (wasOk) { return data; }
                else { return [] };
            });
    }

    displayContents = (responses: any) => {
        db.allDocs()
            .then(content => {
                return content.rows
                    .map<BookDataModel>(v => v.doc as BookDataModel)
                    .map<BookSummary>(v => ({
                        id: v.bookId,
                        author: v.author,
                        banner: `${baseUrl}${v.bannerUrl}`,
                        name: v.name,
                        rate: v.rating,
                        tags: v.tags,
                        thumbnail: `${baseUrl}${v.thumbnailUrl}`
                    }));
            })
            .then(books => this.setState({ ...this.state, books }));
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