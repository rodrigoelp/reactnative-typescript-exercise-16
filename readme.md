# Saving data via PouchDB!

The previous exercise [#15 if you are keeping tabs](https://github.com/rodrigoelp/reactnative-typescript-exercise-15) was about saving data we just downloaded from a site (or restful API... which in this case is static and pushed to github) to later on present it to the user.

The difference between this implementation and the previous one is:

- Previously we used SQLite and now we used PouchDB.
- PouchDB enables synchronisation between your local (offline) database and one stored in the cloud... SQLite is going to be a little more manual.
- PouchDB understands documents, meaning we can use types to read and write from the database.

## Description of this app

The application is going to display a list of products stored in a site. This products require a minimal transformation to get it to a more useful state for the application and we also want the ability of getting the application offline and make it work offline (which I am not tackling entirely here).

The list is going to be pretty simple, it shows the name of the book, author and other minor details.

We are going to be using PouchDB as a local document database to keep a reference of everything we have downloaded.

## Differences between PouchDB and SQLite?

If you don't care that much about databases or don't care about a backend, both offer pretty good functionality to store data.

I particularly liked the fact that PouchDB takes and gives objects as opposed to SQLite in which I need to 'serialize' my objects into the sql syntax.

The other positive aspect I found implementing this exercise was the fact I did not need to create tables to create my document store... But this particular scenario does not require massive queries in a database in which sql would shine. So, take these advantages with a grain of salt.
